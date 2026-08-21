import {
  calculateDuration,
  formatTime,
  getAttendanceStatus,
} from "../../features/attendance/attendanceUtils";

function AttendanceRow({ record }) {
  const status = getAttendanceStatus(
    record.joinTime,
    record.leaveTime
  );

  return (
    <div className="attendance-row">

      <div className="participant-info">
        <div className="participant-avatar">
          {record.participantName
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div>
          <h3>{record.participantName}</h3>
          <p>{record.meetingCode}</p>
        </div>
      </div>

      <div className="attendance-time">
        <span>Joined</span>
        <strong>{formatTime(record.joinTime)}</strong>
      </div>

      <div className="attendance-time">
        <span>Left</span>
        <strong>{formatTime(record.leaveTime)}</strong>
      </div>

      <div className="attendance-time">
        <span>Duration</span>
        <strong>
          {calculateDuration(
            record.joinTime,
            record.leaveTime
          )}
        </strong>
      </div>

      <div>
        <span
          className={`attendance-status ${status.toLowerCase()}`}
        >
          {status}
        </span>
      </div>

    </div>
  );
}

export default AttendanceRow;