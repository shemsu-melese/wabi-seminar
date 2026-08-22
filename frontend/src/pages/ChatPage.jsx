import { useState } from "react";

function ChatPage() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  function handleSendMessage(event) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessage("");
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chat
        </h1>

        <p className="mt-2 text-gray-600">
          Communicate with meeting participants.
        </p>
      </div>

      {/* Chat Container */}
      <div className="grid min-h-[600px] overflow-hidden rounded-xl border bg-white shadow-sm md:grid-cols-3">

        {/* Participants */}
        <div className="border-r">
          <div className="border-b p-5">
            <h2 className="font-bold text-gray-900">
              Participants
            </h2>
          </div>

          <div className="p-5">
            <p className="text-center text-gray-500">
              No participants yet.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col md:col-span-2">

          <div className="border-b p-5">
            <h2 className="font-bold text-gray-900">
              Meeting Chat
            </h2>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-6">

            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    No messages yet
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Start a conversation with your meeting participants.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-end"
                >
                  <div className="max-w-md rounded-xl bg-blue-600 px-4 py-3 text-white">
                    <p className="text-sm font-semibold">
                      {item.sender}
                    </p>

                    <p className="mt-1">
                      {item.text}
                    </p>

                    <p className="mt-2 text-xs text-blue-100">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t bg-white p-4"
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Type a message..."
                className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Send
              </button>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ChatPage;