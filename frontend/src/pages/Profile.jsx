import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import {
  Camera,
  Mail,
  User,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Users,
} from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // =====================================================
  // BACKEND URL
  // =====================================================

  const BACKEND_URL = "http://localhost:5000";

  // =====================================================
  // BUILD PROFILE IMAGE URL
  // =====================================================

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) {
      return null;
    }

    // Local preview URL
    if (avatarUrl.startsWith("blob:")) {
      return avatarUrl;
    }

    // Already a complete URL
    if (
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://")
    ) {
      return avatarUrl;
    }

    // Backend returns /uploads/...
    return `${BACKEND_URL}${avatarUrl}`;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // GET PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/auth/me");

      console.log("PROFILE RESPONSE:", response.data);

      const profileUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data;

      if (!profileUser || !profileUser.name) {
        throw new Error(
          "User information was not returned by the server."
        );
      }

      setUser(profileUser);
    } catch (error) {
      console.error("Profile loading error:", error);
      console.error(
        "Profile error response:",
        error.response?.data
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Unable to load your profile.",
      });

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "Please select an image file.",
      });

      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Image must be smaller than 5 MB.",
      });

      return;
    }

    // Create temporary preview
    const previewUrl = URL.createObjectURL(file);

    setUser((previousUser) => ({
      ...previousUser,
      avatarUrl: previewUrl,
    }));

    const formData = new FormData();

    formData.append("photo", file);

    try {
      setUploading(true);

      const response = await api.post(
        "/users/profile/photo",
        formData
      );

      console.log(
        "PHOTO UPLOAD RESPONSE:",
        response.data
      );

      const newAvatarUrl =
        response.data?.data?.avatarUrl ||
        response.data?.avatarUrl;

      if (newAvatarUrl) {
        setUser((previousUser) => ({
          ...previousUser,
          avatarUrl: newAvatarUrl,
        }));
      }

      setToast({
        type: "success",
        message:
          "Profile photo updated successfully.",
      });
    } catch (error) {
      console.error(
        "Profile photo upload error:",
        error
      );

      await fetchProfile();

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to upload profile photo.",
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      URL.revokeObjectURL(previewUrl);
    }
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = () => {
    if (!user?.name) {
      return "M";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2
              size={32}
              className="text-teal-600 animate-spin"
            />

            <p className="text-sm text-gray-500 mt-3">
              Loading your profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!user) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <User
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mt-5">
              Unable to load profile
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Please refresh the page and try again.
            </p>

            <button
              onClick={fetchProfile}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </main>

        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />
      </div>
    );
  }

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <p className="text-sm font-medium text-teal-700 mb-1">
              Account
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Manage your profile photo and view your
              account information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* PROFILE CARD */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600" />

                <div className="px-6 pb-7">

                  {/* AVATAR */}
                  <div className="relative -mt-14 mb-5">
                    <div className="relative w-28 h-28">

                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-teal-100 flex items-center justify-center">

                        {user.avatarUrl ? (
                          <img
                            src={getAvatarUrl(
                              user.avatarUrl
                            )}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(event) => {
                              console.error(
                                "Avatar failed to load:",
                                getAvatarUrl(
                                  user.avatarUrl
                                )
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="text-3xl font-bold text-teal-700">
                            {getInitials()}
                          </span>
                        )}

                        {!user.avatarUrl && (
                          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-teal-700">
                            {getInitials()}
                          </span>
                        )}
                      </div>

                      {/* CAMERA */}
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={uploading}
                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center border-4 border-white shadow-md hover:bg-teal-800 transition disabled:opacity-60"
                        title="Change profile photo"
                      >
                        {uploading ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Camera size={16} />
                        )}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* NAME */}
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h2>

                  {/* ROLE */}
                  <p className="text-sm text-gray-500 mt-1 capitalize">
                    {user.role || "Mentor"}
                  </p>

                  {/* ACTIVE */}
                  <div className="flex items-center gap-2 mt-5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={16} />

                    <span className="text-xs font-medium">
                      Account Active
                    </span>
                  </div>

                  {/* PHOTO INFO */}
                  <div className="mt-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Camera
                        size={17}
                        className="text-teal-600 mt-0.5"
                      />

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Profile photo
                        </p>

                        <p className="text-xs text-gray-500 mt-1 leading-5">
                          JPG, PNG or WebP.
                          Maximum size is 5 MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="lg:col-span-2 space-y-6">

              {/* PERSONAL INFORMATION */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-7">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <User
                      size={19}
                      className="text-teal-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Personal Information
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      Information managed by the
                      administrator.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">

                  {/* NAME */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Full Name
                    </label>

                    <div className="mt-2 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <User
                        size={17}
                        className="text-gray-400"
                      />

                      <span className="text-sm font-medium text-gray-800">
                        {user.name}
                      </span>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email Address
                    </label>

                    <div className="mt-2 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <Mail
                        size={17}
                        className="text-gray-400"
                      />

                      <span className="text-sm font-medium text-gray-800 break-all">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* ROLE */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Account Role
                    </label>

                    <div className="mt-2 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <ShieldCheck
                        size={17}
                        className="text-gray-400"
                      />

                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {user.role || "mentor"}
                      </span>
                    </div>
                  </div>

                  {/* BATCH */}
                  {user.batch && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Assigned Batch
                      </label>

                      <div className="mt-2 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                        <Users
                          size={17}
                          className="text-gray-400"
                        />

                        <span className="text-sm font-medium text-gray-800">
                          {user.batch.name ||
                            user.batch}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ACCOUNT STATUS */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-7">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Account Status
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      Your account is currently active.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Active Account
                    </p>

                    <p className="text-xs text-emerald-600 mt-1">
                      You can access the mentor dashboard.
                    </p>
                  </div>

                  <CheckCircle2
                    size={24}
                    className="text-emerald-600"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default Profile;