import Sidebar from "../components/mentor/Sidebar";

function Profile() {
  const formData = {
    fullName: "Yunus Hasen",
    email: "yunas@gmail.com",
    phone: "0912345678",
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>

        <p className="text-gray-500 text-sm mb-6">
          View your account information.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
              <span className="text-teal-800 text-xl font-semibold">
                {formData.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </span>
            </div>

            <div>
              <p className="font-semibold text-gray-800">{formData.fullName}</p>

              <p className="text-sm text-gray-500">Mentor</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Full Name
              </label>

              <input
                type="text"
                value={formData.fullName}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>

              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>

              <input
                type="text"
                value={formData.phone}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
