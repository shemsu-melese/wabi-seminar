import { useState } from "react";

function ChatPanel({
  messages,
  onSendMessage,
  onClose,
}) {
  const [message, setMessage] = useState("");

  function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    onSendMessage(trimmedMessage);

    setMessage("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSend();
    }
  }

  return (
    <aside className="chat-panel">

      {/* Header */}

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
          onClick={onClose}
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
              {item.sender
                .charAt(0)
                .toUpperCase()}
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


      {/* Input */}

      <div className="chat-input-container">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
        >
          Send
        </button>

      </div>

    </aside>
  );
}

export default ChatPanel;