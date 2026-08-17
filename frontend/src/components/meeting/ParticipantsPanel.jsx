function ParticipantsPanel({
  participants,
  onClose,
  onInvite,
  copied,
}) {
  return (
    <aside className="participants-panel">

      {/* Header */}

      <div className="participants-header">

        <div>

          <h2>
            Participants
          </h2>

          <span>
            {participants.length}{" "}
            {participants.length === 1
              ? "person"
              : "people"}
          </span>

        </div>

        <button
          className="participants-close-button"
          onClick={onClose}
        >
          ×
        </button>

      </div>


      {/* Participants */}

      <div className="participants-list">

        {participants.map((participant) => (
          <div
            key={participant.id}
            className="participant-item"
          >

            <div className="participant-avatar">
              {participant.name
                .charAt(0)
                .toUpperCase()}
            </div>


            <div className="participant-info">

              <strong>

                {participant.name}

                {participant.isYou && (
                  <span className="you-label">
                    You
                  </span>
                )}

              </strong>

              {participant.handRaised && (
                <span className="participant-hand">
                  ✋ Hand raised
                </span>
              )}

            </div>


            <div className="participant-status">

              <span
                className={
                  participant.micOn
                    ? "status-on"
                    : "status-off"
                }
              >
                {participant.micOn
                  ? "🎤"
                  : "🔇"}
              </span>

              <span
                className={
                  participant.cameraOn
                    ? "status-on"
                    : "status-off"
                }
              >
                {participant.cameraOn
                  ? "🎥"
                  : "🚫"}
              </span>

            </div>

          </div>
        ))}

      </div>


      {/* Footer */}

      <div className="participants-footer">

        <button
          className="invite-button"
          onClick={onInvite}
        >
          {copied
            ? "Meeting code copied"
            : "Invite people"}
        </button>

      </div>

    </aside>
  );
}

export default ParticipantsPanel;