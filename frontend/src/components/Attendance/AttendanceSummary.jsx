function AttendanceSummary({ attendance }) {
  const total = attendance.length;

  const present = attendance.filter(
    (record) => record.joinTime
  ).length;

  const active = attendance.filter(
    (record) => !record.leaveTime
  ).length;

  return (
    <div className="attendance-summary">

      <div className="summary-card">
        <span>Total Participants</span>
        <strong>{total}</strong>
      </div>

      <div className="summary-card">
        <span>Present</span>
        <strong>{present}</strong>
      </div>

      <div className="summary-card">
        <span>Currently In Meeting</span>
        <strong>{active}</strong>
      </div>

    </div>
  );
}

export default AttendanceSummary;