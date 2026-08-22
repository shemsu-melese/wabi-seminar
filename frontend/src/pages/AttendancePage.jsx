function AttendancePage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-2 text-gray-600">
          Track attendance and participation in your meetings.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
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
            Present
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Absent
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            0
          </h2>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Attendance Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  Meeting
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  Date
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                  Duration
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No attendance records yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;