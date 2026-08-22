import { Link, Outlet, useLocation } from "react-router-dom";

function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Meetings",
      path: "/meetings",
    },
    {
      name: "Attendance",
      path: "/attendance",
    },
    {
      name: "Chat",
      path: "/chat",
    },
    {
      name: "Meeting History",
      path: "/history",
    },
    {
      name: "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-white md:block">

        {/* Logo */}
        <div className="border-b p-6">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-blue-600"
          >
            Wabi Seminar
          </Link>

          <p className="mt-1 text-sm text-gray-500">
            Meeting Platform
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-4 py-3 font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {navItems.find(
                  (item) => item.path === location.pathname
                )?.name || "Dashboard"}
              </h2>

              <p className="text-sm text-gray-500">
                Welcome back
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;