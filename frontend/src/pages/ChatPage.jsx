import { useState } from "react";

const participants = [
  {
    id: 1,
    name: "Abdisa Dessalegn",
    role: "Host",
    online: true,
  },
  {
    id: 2,
    name: "Ahmed",
    role: "Participant",
    online: true,
  },
  {
    id: 3,
    name: "Hana",
    role: "Participant",
    online: true,
  },
  {
    id: 4,
    name: "Dawit",
    role: "Participant",
    online: false,
  },
];

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
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                Participants
              </h2>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                {participants.length}
              </span>
            </div>
          </div>

          <div className="space-y-2 p-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                    {participant.name.charAt(0)}
                  </div>

                  {/* Online status */}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      participant.online
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* Participant information */}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {participant.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {participant.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Meeting Chat */}
        <div className="flex flex-col md:col-span-2">

          {/* Chat Header */}
          <div className="border-b p-5">
            <h2 className="font-bold text-gray-900">
              Meeting Chat
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {participants.length} participants
            </p>
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