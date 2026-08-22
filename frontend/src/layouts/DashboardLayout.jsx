import { Link, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white border-r md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Wabi Seminar
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          <Link
            to="/dashboard"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            to="/meetings"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Meetings
          </Link>

          <Link
            to="/attendance"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Attendance
          </Link>

          <Link
            to="/chat"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Chat
          </Link>

          <Link
            to="/history"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Meeting History
          </Link>

          <Link
            to="/settings"
            className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard
            </h2>

            <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;