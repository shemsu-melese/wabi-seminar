import useAttendance from "../hooks/useAttendance";

import AttendanceSummary from "../components/attendance/AttendanceSummary";
import AttendanceTable from "../components/attendance/AttendanceTable";

import "./AttendancePage.css";

function AttendancePage() {
  const { attendance } = useAttendance();

  return (
    <div className="attendance-page">

      <div className="attendance-header-section">

        <div>
          <span className="attendance-badge">
            WABI MEETING
          </span>

          <h1>Attendance</h1>

          <p>
            Track meeting participants, joining times,
            leaving times, and attendance duration.
          </p>
        </div>

      </div>

      <AttendanceSummary
        attendance={attendance}
      />

      <section className="attendance-section">

        <div className="section-title">
          <div>
            <h2>Attendance Records</h2>

            <p>
              View participant attendance history.
            </p>
          </div>
        </div>

        <AttendanceTable
          attendance={attendance}
        />

      </section>

    </div>
  );
}

export default AttendancePage;