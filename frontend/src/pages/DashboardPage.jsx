function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Wabi Seminar
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your meetings from your dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Meetings
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Upcoming Meetings
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Attendance
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            0
          </h2>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;