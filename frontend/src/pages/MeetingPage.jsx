function MeetingPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Meetings
        </h1>

        <p className="mt-2 text-gray-600">
          Create, manage, and join your meetings.
        </p>
      </div>

      {/* Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          Create Meeting
        </button>

        <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100">
          Join Meeting
        </button>
      </div>

      {/* Meeting List */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Meetings
          </h2>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            0 Meetings
          </span>
        </div>

        {/* Empty State */}
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No upcoming meetings
          </h3>

          <p className="mt-2 text-gray-500">
            Create a new meeting or join an existing meeting.
          </p>

          <button className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
            Create Your First Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingPage;