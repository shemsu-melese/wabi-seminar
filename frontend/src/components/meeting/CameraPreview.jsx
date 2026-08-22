function CameraPreview({
  cameraOn,
  handRaised,
  reaction,
}) {
  return (
    <section className="camera-container">

      <div className="camera-preview">

        {cameraOn ? (
          <div className="camera-placeholder">

            <div className="camera-icon">
              🎥
            </div>

            <span>
              Camera preview
            </span>

          </div>
        ) : (
          <div className="camera-off">

            <div className="camera-off-icon">
              ◉
            </div>

            <span>
              Camera is off
            </span>

          </div>
        )}

        {handRaised && (
          <div className="hand-raised-indicator">
            ✋ Hand raised
          </div>
        )}

        {reaction && (
          <div className="floating-reaction">
            {reaction}
          </div>
        )}

      </div>

    </section>
  );
}

export default CameraPreview;