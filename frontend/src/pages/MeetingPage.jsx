import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import MeetingCode from "../components/meeting/MeetingCode";
import useMeetings from "../hooks/useMeeting";
 import MeetingHeader from "../components/meeting/MeetingHeader";
 import CameraPreview from "../components/meeting/CameraPreview";
 import MeetingControls from "../components/meeting/MeetingControls";
 import ParticipantsPanel from "../components/meeting/ParticipantsPanel.jsx";
import ChatPanel from "../components/meeting/ChatPanel.jsx";

import "./MeetingPage.css";

function MeetingPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "You",
      text: "Welcome to the meeting!",
    },
  ]);

  // Reaction
  const [reaction, setReaction] = useState(null);

  function handleCopyCode() {
    navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleLeaveMeeting() {
    navigate("/dashboard");
  }

  function handleSendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  }

  function handleMessageKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function handleReaction(selectedReaction) {
    setReaction(selectedReaction);

    setTimeout(() => {
      setReaction(null);
    }, 2500);
  }

  return (
    <div className="meeting-page">

      {/* Header */}
      <header className="meeting-header">
        <div className="meeting-header-inner">

          <div className="meeting-brand">
            <div className="meeting-brand-mark">
              W
            </div>

            <span>
              Wabi Meeting
            </span>
          </div>

          <button
            className="leave-top-button"
            onClick={handleLeaveMeeting}
          >
            Leave meeting
          </button>

        </div>
      </header>


      {/* Main */}
      <main className="meeting-main">

        {/* Heading */}
        <section className="meeting-intro">

          <p className="meeting-eyebrow">
            Meeting room
          </p>

          <h1>
            You're in the meeting
          </h1>

          <div className="meeting-code-container">

            <span className="meeting-code-label">
              Meeting code
            </span>

            <strong className="meeting-code-value">
              {code}
            </strong>

            <button
              className="copy-code-button"
              onClick={handleCopyCode}
            >
              {copied ? "Copied" : "Copy"}
            </button>

          </div>

        </section>


        {/* Camera */}
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

            {/* Reaction floating above video */}
            {reaction && (
              <div className="floating-reaction">
                {reaction}
              </div>
            )}

            {/* Raised hand indicator */}
            {handRaised && (
              <div className="hand-raised-indicator">
                ✋ Hand raised
              </div>
            )}

          </div>

        </section>


        {/* Reaction bar */}
        <section className="reaction-section">

          <span className="reaction-label">
            Reactions
          </span>

          <div className="reaction-buttons">

            <button
              onClick={() => handleReaction("👍")}
              className="reaction-button"
              title="Like"
            >
              👍
            </button>

            <button
              onClick={() => handleReaction("❤️")}
              className="reaction-button"
              title="Love"
            >
              ❤️
            </button>

            <button
              onClick={() => handleReaction("😂")}
              className="reaction-button"
              title="Laugh"
            >
              😂
            </button>

            <button
              onClick={() => handleReaction("👏")}
              className="reaction-button"
              title="Clap"
            >
              👏
            </button>

            <button
              onClick={() => handleReaction("😮")}
              className="reaction-button"
              title="Wow"
            >
              😮
            </button>

          </div>

        </section>


        {/* Controls */}
        <section className="meeting-controls">

          {/* Mic */}
          <button
            className={`meeting-control ${
              micOn
                ? "control-active"
                : "control-off"
            }`}
            onClick={() => setMicOn(!micOn)}
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
            onClick={() => setCameraOn(!cameraOn)}
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


          {/* Raise hand */}
          <button
            className={`meeting-control ${
              handRaised
                ? "control-hand-active"
                : "control-active"
            }`}
            onClick={() => setHandRaised(!handRaised)}
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
            onClick={() => setChatOpen(!chatOpen)}
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
            onClick={handleLeaveMeeting}
          >
            <span className="control-icon">
              ☎
            </span>

            <span>
              Leave
            </span>
          </button>

        </section>

      </main>


      {/* Chat panel */}
      {chatOpen && (
        <aside className="chat-panel">

          <div className="chat-header">

            <div>
              <h2>
                Meeting chat
              </h2>

              <span>
                {messages.length} messages
              </span>
            </div>

            <button
              className="chat-close-button"
              onClick={() => setChatOpen(false)}
            >
              ×
            </button>

          </div>


          {/* Messages */}
          <div className="chat-messages">

            {messages.map((item) => (
              <div
                key={item.id}
                className="chat-message"
              >

                <div className="chat-avatar">
                  W
                </div>

                <div className="chat-message-content">

                  <strong>
                    {item.sender}
                  </strong>

                  <p>
                    {item.text}
                  </p>

                </div>

              </div>
            ))}

          </div>


          {/* Typing area */}
          <div className="chat-input-container">

            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleMessageKeyDown}
            />

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              Send
            </button>

          </div>

        </aside>
      )}

    </div>
  );
}

export default MeetingPage;