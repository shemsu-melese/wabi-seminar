import { useState } from "react";

function generateMeetingCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 9; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}`;
}

function useMeeting() {
  const [meetings, setMeetings] = useState([]);

  function addMeeting(title = "Instant Meeting") {
    const meeting = {
      id: Date.now(),
      title,
      code: generateMeetingCode(),
      createdAt: new Date().toISOString(),
    };

    setMeetings((currentMeetings) => [
      ...currentMeetings,
      meeting,
    ]);

    return meeting;
  }

  return {
    meetings,
    addMeeting,
  };
}

export default useMeeting;