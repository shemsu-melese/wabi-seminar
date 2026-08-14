function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-600">
          Wabi Seminar
        </h1>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#home"
            className="text-gray-700 hover:text-blue-600"
          >
            Home
          </a>

          <a
            href="#features"
            className="text-gray-700 hover:text-blue-600"
          >
            Features
          </a>

          <a
            href="#about"
            className="text-gray-700 hover:text-blue-600"
          >
            About
          </a>

          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar