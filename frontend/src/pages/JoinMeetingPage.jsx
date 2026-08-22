function JoinMeetingPage() {
  return (
    <div className="mx-auto max-w-4xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Join Meeting
        </h1>

        <p className="mt-2 text-gray-600">
          Enter a meeting code to join a meeting.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <form className="space-y-6">

          <div>
            <label
              htmlFor="meetingCode"
              className="mb-2 block font-medium text-gray-700"
            >
              Meeting Code
            </label>

            <input
              id="meetingCode"
              type="text"
              placeholder="Enter meeting code"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Join Meeting
          </button>

        </form>

      </div>

    </div>
  );
}

export default JoinMeetingPage;