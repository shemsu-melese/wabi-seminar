import { Link } from "react-router-dom";
function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="mx-auto flex min-h-150 max-w-7xl items-center px-6 py-20"
      >
        <div className="max-w-3xl">
          {/* <p className="mb-4 font-semibold text-blue-600">
            Wabi Seminar
          </p> */}

          <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            Modern meetings made simple
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Create, manage, and join meetings with a simple and
            powerful meeting platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>

            <Link
                to="/meetings"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Join Meeting
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need for better meetings
            </h2>

            <p className="mt-4 text-gray-600">
              Simple tools for creating and managing your meetings.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Easy Meetings
              </h3>

              <p className="mt-3 text-gray-600">
                Create meetings quickly and invite participants.
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Attendance
              </h3>

              <p className="mt-3 text-gray-600">
                Track meeting attendance and participation.
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Meeting Management
              </h3>

              <p className="mt-3 text-gray-600">
                Manage your meetings from one convenient dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            About Wabi Seminar
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Wabi Seminar is a modern meeting platform designed to
            make meetings easier to organize, manage, and attend.
          </p>
        </div>
      </section>
    </>
  );
}

export default HomePage;