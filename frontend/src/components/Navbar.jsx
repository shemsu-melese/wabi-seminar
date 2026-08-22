import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          Wabi Seminar
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>

          <a
            href="/#features"
            className="text-gray-700 hover:text-blue-600"
          >
            Features
          </a>

          <a
            href="/#about"
            className="text-gray-700 hover:text-blue-600"
          >
            About
          </a>

          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;