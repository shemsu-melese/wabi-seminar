function MeetingHistoryPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Meeting History
        </h1>

        <p className="mt-2 text-gray-600">
          View your previous meetings and meeting activity.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Search meetings..."
          className="flex-1 rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
        />

        <select className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500">
          <option>All Meetings</option>
          <option>Hosted</option>
          <option>Joined</option>
        </select>
      </div>

      {/* History */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Previous Meetings
        </h2>

        {/* Empty State */}
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No meeting history
          </h3>

          <p className="mt-2 text-gray-500">
            Your completed meetings will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MeetingHistoryPage;