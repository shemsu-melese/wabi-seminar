function MeetingHeader({ meetingCode, onLeave }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div>
        <h1 className="font-semibold text-gray-900">
          Wabi Meeting
        </h1>

        <p className="text-sm text-gray-500">
          {meetingCode}
        </p>
      </div>

      <button
        onClick={onLeave}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Leave meeting
      </button>
    </header>
  );
}

export default MeetingHeader;