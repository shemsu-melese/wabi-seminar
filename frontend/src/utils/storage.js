const MEETINGS_KEY = "wabi_meetings";

export function getMeetings() {
  try {
    const storedMeetings = localStorage.getItem(MEETINGS_KEY);

    if (!storedMeetings) {
      return [];
    }

    return JSON.parse(storedMeetings);
  } catch (error) {
    console.error("Failed to load meetings:", error);
    return [];
  }
}

export function saveMeetings(meetings) {
  try {
    localStorage.setItem(
      MEETINGS_KEY,
      JSON.stringify(meetings)
    );
  } catch (error) {
    console.error("Failed to save meetings:", error);
  }
}