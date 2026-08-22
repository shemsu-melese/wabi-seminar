import AttendanceRow from "./AttendanceRow";

function AttendanceTable({ attendance }) {
  if (attendance.length === 0) {
    return (
      <div className="attendance-empty">
        <h3>No attendance records</h3>

        <p>
          Attendance will appear here when participants
          join a meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="attendance-table">

      <div className="attendance-header">
        <span>Participant</span>
        <span>Joined</span>
        <span>Left</span>
        <span>Duration</span>
        <span>Status</span>
      </div>

      {attendance.map((record) => (
        <AttendanceRow
          key={record.id}
          record={record}
        />
      ))}

    </div>
  );
}

export default AttendanceTable;