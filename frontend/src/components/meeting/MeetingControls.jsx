function MeetingControls({
  micOn,
  cameraOn,
  handRaised,

  participantsOpen,
  chatOpen,

  onMicToggle,
  onCameraToggle,
  onHandToggle,

  onParticipantsToggle,
  onChatToggle,

  onLeave,
}) {
  return (
    <section className="meeting-controls">

      {/* Mic */}

      <button
        className={`meeting-control ${
          micOn
            ? "control-active"
            : "control-off"
        }`}
        onClick={onMicToggle}
      >
        <span className="control-icon">
          🎤
        </span>

        <span>
          {micOn ? "Mic" : "Mic off"}
        </span>
      </button>


      {/* Camera */}

      <button
        className={`meeting-control ${
          cameraOn
            ? "control-active"
            : "control-off"
        }`}
        onClick={onCameraToggle}
      >
        <span className="control-icon">
          🎥
        </span>

        <span>
          {cameraOn
            ? "Camera"
            : "Camera off"}
        </span>
      </button>


      {/* Participants */}

      <button
        className={`meeting-control ${
          participantsOpen
            ? "control-chat-active"
            : "control-active"
        }`}
        onClick={onParticipantsToggle}
      >
        <span className="control-icon">
          👥
        </span>

        <span>
          People
        </span>
      </button>


      {/* Raise hand */}

      <button
        className={`meeting-control ${
          handRaised
            ? "control-hand-active"
            : "control-active"
        }`}
        onClick={onHandToggle}
      >
        <span className="control-icon">
          ✋
        </span>

        <span>
          {handRaised
            ? "Lower hand"
            : "Raise hand"}
        </span>
      </button>


      {/* Chat */}

      <button
        className={`meeting-control ${
          chatOpen
            ? "control-chat-active"
            : "control-active"
        }`}
        onClick={onChatToggle}
      >
        <span className="control-icon">
          💬
        </span>

        <span>
          Chat
        </span>
      </button>


      {/* Leave */}

      <button
        className="meeting-control leave-control"
        onClick={onLeave}
      >
        <span className="control-icon">
          ☎
        </span>

        <span>
          Leave
        </span>
      </button>

    </section>
  );
}

export default MeetingControls;