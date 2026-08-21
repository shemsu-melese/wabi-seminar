const STORAGE_KEY = "wabi_attendance";

function getAttendance() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read attendance:", error);
    return [];
  }
}

function saveAttendance(attendance) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(attendance)
  );
}

export function createAttendance({
  meetingCode,
  participantName,
}) {
  const attendance = getAttendance();

  const record = {
    id: crypto.randomUUID(),
    meetingCode,
    participantName,
    joinTime: new Date().toISOString(),
    leaveTime: null,
  };

  attendance.push(record);

  saveAttendance(attendance);

  return record;
}

export function markAttendanceLeave(id) {
  const attendance = getAttendance();

  const updatedAttendance = attendance.map((record) => {
    if (record.id === id) {
      return {
        ...record,
        leaveTime: new Date().toISOString(),
      };
    }

    return record;
  });

  saveAttendance(updatedAttendance);

  return updatedAttendance.find(
    (record) => record.id === id
  );
}

export function getMeetingAttendance(meetingCode) {
  return getAttendance().filter(
    (record) => record.meetingCode === meetingCode
  );
}

export function getAllAttendance() {
  return getAttendance();
}

export function clearAttendance() {
  localStorage.removeItem(STORAGE_KEY);
}