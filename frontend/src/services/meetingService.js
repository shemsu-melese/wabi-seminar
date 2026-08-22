const MEETINGS_KEY = "wabi_meetings";

/**
 * Get all meetings
 */
function getMeetings() {
  const storedMeetings = localStorage.getItem(MEETINGS_KEY);

  if (!storedMeetings) {
    return [];
  }

  try {
    return JSON.parse(storedMeetings);
  } catch (error) {
    console.error("Failed to read meetings:", error);
    return [];
  }
}

/**
 * Save meetings
 */
function saveMeetings(meetings) {
  localStorage.setItem(
    MEETINGS_KEY,
    JSON.stringify(meetings)
  );
}

/**
 * Get one meeting
 */
export function getMeeting(code) {
  const meetings = getMeetings();

  return meetings.find(
    (meeting) => meeting.code === code
  );
}

/**
 * Create a meeting
 */
export function createMeeting(name = "Instant Meeting") {
  const meetings = getMeetings();

  const meeting = {
    id: crypto.randomUUID(),
    code: generateMeetingCode(),
    name,
    createdAt: new Date().toISOString(),
    participants: [],
  };

  meetings.push(meeting);

  saveMeetings(meetings);

  return meeting;
}

/**
 * Join a meeting
 */
export function joinMeeting(code, participant) {
  const meetings = getMeetings();

  const meetingIndex = meetings.findIndex(
    (meeting) => meeting.code === code
  );

  if (meetingIndex === -1) {
    throw new Error("Meeting not found");
  }

  const meeting = meetings[meetingIndex];

  const existingParticipant =
    meeting.participants.find(
      (item) => item.id === participant.id
    );

  if (!existingParticipant) {
    meeting.participants.push({
      ...participant,
      joinedAt: new Date().toISOString(),
    });
  }

  meetings[meetingIndex] = meeting;

  saveMeetings(meetings);

  return meeting;
}

/**
 * Leave a meeting
 */
export function leaveMeeting(
  code,
  participantId
) {
  const meetings = getMeetings();

  const meetingIndex = meetings.findIndex(
    (meeting) => meeting.code === code
  );

  if (meetingIndex === -1) {
    throw new Error("Meeting not found");
  }

  const meeting = meetings[meetingIndex];

  meeting.participants =
    meeting.participants.filter(
      (participant) =>
        participant.id !== participantId
    );

  meetings[meetingIndex] = meeting;

  saveMeetings(meetings);

  return meeting;
}

/**
 * Generate meeting code
 */
function generateMeetingCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 9; i++) {
    code += characters.charAt(
      Math.floor(
        Math.random() * characters.length
      )
    );
  }

  return `${code.slice(0, 3)}-${code.slice(
    3,
    6
  )}-${code.slice(6, 9)}`;
}