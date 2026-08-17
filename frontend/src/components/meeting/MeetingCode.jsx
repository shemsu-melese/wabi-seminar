function MeetingCode({
  code,
  copied,
  onCopy,
}) {
  return (
    <div className="meeting-code-container">

      <span className="meeting-code-label">
        Meeting code
      </span>

      <strong className="meeting-code-value">
        {code}
      </strong>

      <button
        className="copy-code-button"
        onClick={onCopy}
      >
        {copied ? "Copied" : "Copy"}
      </button>

    </div>
  );
}

export default MeetingCode;