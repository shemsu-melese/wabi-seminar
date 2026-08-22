function SettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your account and meeting preferences.
        </p>
      </div>

      <div className="space-y-6">

        {/* Profile Settings */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Profile
          </h2>

          <p className="mt-1 text-gray-500">
            Update your personal information.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            Save Changes
          </button>
        </div>

        {/* Meeting Settings */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Meeting Preferences
          </h2>

          <p className="mt-1 text-gray-500">
            Configure your meeting preferences.
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5"
              />

              <span className="text-gray-700">
                Automatically mute microphone when joining
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5"
              />

              <span className="text-gray-700">
                Automatically turn off camera when joining
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5"
              />

              <span className="text-gray-700">
                Enable meeting notifications
              </span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Security
          </h2>

          <p className="mt-1 text-gray-500">
            Manage your account security.
          </p>

          <button className="mt-6 rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100">
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;