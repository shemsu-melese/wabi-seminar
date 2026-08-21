import { useState } from "react";

import {
  createAttendance,
  markAttendanceLeave,
  getMeetingAttendance,
  getAllAttendance,
} from "../features/attendance/attendanceService";

function useAttendance() {
  const [attendance, setAttendance] = useState(
    getAllAttendance()
  );

  function joinMeeting(meetingCode, participantName) {
    const record = createAttendance({
      meetingCode,
      participantName,
    });

    setAttendance(getAllAttendance());

    return record;
  }

  function leaveMeeting(id) {
    const record = markAttendanceLeave(id);

    setAttendance(getAllAttendance());

    return record;
  }

  function getAttendanceByMeeting(meetingCode) {
    return getMeetingAttendance(meetingCode);
  }

  return {
    attendance,
    joinMeeting,
    leaveMeeting,
    getAttendanceByMeeting,
  };
}

export default useAttendance;