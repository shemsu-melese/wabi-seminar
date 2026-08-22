import { useState } from "react";

function AttendancePage() {
  const [attendance, setAttendance] = useState([
    {
      id: 1,
      name: "Abdisa",
      email: "abdisa@example.com",
      meeting: "Weekly Team Meeting",
      status: "Present",
    },
    {
      id: 2,
      name: "John",
      email: "john@example.com",
      meeting: "Weekly Team Meeting",
      status: "Absent",
    },
    {
      id: 3,
      name: "Sarah",
      email: "sarah@example.com",
      meeting: "Project Planning",
      status: "Present",
    },
  ]);

  function toggleAttendance(id) {
    setAttendance((previous) =>
      previous.map((person) =>
        person.id === id
          ? {
              ...person,
              status:
                person.status === "Present"
                  ? "Absent"
                  : "Present",
            }
          : person
      )
    );
  }

  const presentCount = attendance.filter(
    (person) => person.status === "Present"
  ).length;

  const absentCount = attendance.filter(
    (person) => person.status === "Absent"
  ).length;

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-2 text-gray-600">
          Track meeting attendance and participation.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Participants
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {attendance.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Present
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {presentCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Absent
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {absentCount}
          </p>
        </div>

      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">
            Attendance Records
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Participant
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Meeting
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

              {attendance.map((person) => (
                <tr key={person.id}>

                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {person.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {person.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {person.meeting}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={
                        person.status === "Present"
                          ? "rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600"
                          : "rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600"
                      }
                    >
                      {person.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() =>
                        toggleAttendance(person.id)
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Change Status
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default AttendancePage;