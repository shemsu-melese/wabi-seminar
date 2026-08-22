import { useState } from "react";

import Button from "../components/Button/Button";
import MeetingCard from "../components/MeetingCard/MeetingCard";
import CreateMeetingForm from "../components/CreateMeetingForm/CreateMeetingForm";

function MeetingPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>

      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meetings
          </h1>

          <p className="mt-2 text-gray-600">
            Create, manage, and join your meetings.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateForm(true)}
        >
          Create Meeting
        </Button>

      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <CreateMeetingForm
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Meeting Summary */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Meetings
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            3
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Upcoming
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            2
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            1
          </p>
        </div>

      </div>

      {/* Upcoming Meetings */}
      <div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Meetings
          </h2>

          <span className="text-sm text-gray-500">
            2 meetings
          </span>
        </div>

        <div className="space-y-5">

          <MeetingCard
            title="Weekly Team Meeting"
            date="August 25, 2026"
            time="10:00 AM"
            host="Abdisa"
            participants="8"
          />

          <MeetingCard
            title="Project Planning"
            date="August 27, 2026"
            time="2:00 PM"
            host="Abdisa"
            participants="12"
          />

        </div>

      </div>

    </div>
  );
}

export default MeetingPage;