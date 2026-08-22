function ChatPage() {
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

          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No messages yet
              </h3>

              <p className="mt-2 text-gray-500">
                Start a conversation with your meeting participants.
              </p>
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />

              <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ChatPage;