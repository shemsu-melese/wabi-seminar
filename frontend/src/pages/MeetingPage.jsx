import { useState } from "react";

import Button from "../components/Button/Button";
import MeetingCard from "../components/MeetingCard/MeetingCard";
import CreateMeetingForm from "../components/CreateMeetingForm/CreateMeetingForm";

function MeetingPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Weekly Team Meeting",
      date: "August 25, 2026",
      time: "10:00 AM",
      host: "Abdisa",
      participants: 8,
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Project Planning",
      date: "August 27, 2026",
      time: "2:00 PM",
      host: "Abdisa",
      participants: 12,
      status: "Upcoming",
    },
  ]);

  function handleCreateMeeting(newMeeting) {
    const meeting = {
      id: Date.now(),
      title: newMeeting.title,
      date: newMeeting.date,
      time: newMeeting.time,
      host: "Abdisa",
      participants: 0,
      status: "Upcoming",
    };

    setMeetings((previousMeetings) => [
      ...previousMeetings,
      meeting,
    ]);

    setShowCreateForm(false);
  }
  function handleDeleteMeeting(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this meeting?"
  );

  if (!confirmed) {
    return;
  }

  setMeetings((previousMeetings) =>
    previousMeetings.filter(
      (meeting) => meeting.id !== id
    )
  );
}

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

        <Button onClick={() => setShowCreateForm(true)}>
          Create Meeting
        </Button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <CreateMeetingForm
          onCancel={() => setShowCreateForm(false)}
          onCreate={handleCreateMeeting}
        />
      )}

      {/* Meeting Summary */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Meetings
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {meetings.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Upcoming
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {meetings.filter(
              (meeting) => meeting.status === "Upcoming"
            ).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {meetings.filter(
              (meeting) => meeting.status === "Completed"
            ).length}
          </p>
        </div>

      </div>

      {/* Meetings */}
      <div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Meetings
          </h2>

          <span className="text-sm text-gray-500">
            {meetings.length} meetings
          </span>
        </div>

        <div className="space-y-5">

          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <MeetingCard
                    key={meeting.id}
                    title={meeting.title}
                    date={meeting.date}
                    time={meeting.time}
                    host={meeting.host}
                    participants={meeting.participants}
                    status={meeting.status}
                    onDelete={() => handleDeleteMeeting(meeting.id)}
                    />
            ))
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No meetings
              </h3>

              <p className="mt-2 text-gray-500">
                Create your first meeting to get started.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default MeetingPage;