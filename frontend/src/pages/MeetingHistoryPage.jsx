import { useState } from "react";

function MeetingHistoryPage() {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Weekly Team Meeting",
      date: "August 18, 2026",
      time: "10:00 AM",
      host: "Abdisa",
      participants: 8,
      status: "Completed",
    },
    {
      id: 2,
      title: "Project Planning",
      date: "August 15, 2026",
      time: "2:00 PM",
      host: "Abdisa",
      participants: 12,
      status: "Completed",
    },
    {
      id: 3,
      title: "Team Discussion",
      date: "August 10, 2026",
      time: "11:00 AM",
      host: "Abdisa",
      participants: 6,
      status: "Completed",
    },
  ]);

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this meeting from history?"
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Meeting History
        </h1>

        <p className="mt-2 text-gray-600">
          View your previous meetings and attendance records.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Meetings
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {meetings.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {meetings.filter(
              (meeting) => meeting.status === "Completed"
            ).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Participants
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {meetings.reduce(
              (total, meeting) =>
                total + meeting.participants,
              0
            )}
          </p>
        </div>

      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">
            Previous Meetings
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Meeting
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Date
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Host
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Participants
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <tr key={meeting.id}>

                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {meeting.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        {meeting.time}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {meeting.date}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {meeting.host}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {meeting.participants}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
                        {meeting.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <button
                        onClick={() =>
                          handleDelete(meeting.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >
                    <p className="font-medium text-gray-900">
                      No meeting history
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Completed meetings will appear here.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default MeetingHistoryPage;