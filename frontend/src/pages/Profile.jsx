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
} from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error) {
      console.error("Profile loading error:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to load your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "Please select an image file.",
      });

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Image must be smaller than 5 MB.",
      });

      return;
    }

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

      const newAvatarUrl =
        response.data?.data?.avatarUrl;

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

  const getInitials = () => {
    if (!user?.name) {
      return "M";
    }

    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

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

  if (!user) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-md">
            <h2 className="text-lg font-semibold text-gray-900">
              Unable to load profile
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Please refresh the page and try again.
            </p>

            <button
              onClick={fetchProfile}
              className="mt-5 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition"
            >
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">

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

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600" />

                <div className="px-6 pb-7">

                  <div className="relative -mt-14 mb-5">
                    <div className="relative w-28 h-28">

                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-teal-100 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-teal-700">
                            {getInitials()}
                          </span>
                        )}
                      </div>

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

                  <h2 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Mentor
                  </p>

                  <div className="flex items-center gap-2 mt-5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={16} />

                    <span className="text-xs font-medium">
                      Account Active
                    </span>
                  </div>

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
                          JPG, PNG or WebP. Maximum
                          size is 5 MB.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">

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
                        {user.role}
                      </span>
                    </div>
                  </div>

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