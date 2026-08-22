import Button from "../components/Button/Button";
import MeetingCard from "../components/MeetingCard/MeetingCard";
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
        <Button>
                Create Meeting
        </Button>

        <Button variant="secondary">
            Join Meeting
        </Button>
      </div>

      {/* Meeting List */}
            
        <div>
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
            Upcoming Meetings
            </h2>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            2 Meetings
            </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <MeetingCard
            title="Weekly Team Meeting"
            date="August 25, 2026"
            time="10:00 AM"
            host="Wabi Seminar"
            />

            <MeetingCard
            title="Project Planning"
            date="August 27, 2026"
            time="2:00 PM"
            host="Wabi Team"
            />
        </div>
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
    
  );
}

export default MeetingPage;