export function calculateDuration(joinTime, leaveTime) {
  if (!joinTime) {
    return "0 min";
  }

  const start = new Date(joinTime);
  const end = leaveTime ? new Date(leaveTime) : new Date();

  const difference = Math.max(0, end - start);

  const minutes = Math.floor(difference / 60000);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export function formatTime(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAttendanceStatus(joinTime, leaveTime) {
  if (!joinTime) {
    return "Absent";
  }

  if (!leaveTime) {
    return "Present";
  }

  return "Present";
}