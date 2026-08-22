import { Link } from "react-router-dom";
import Button from "../components/Button/Button";

function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in to your Wabi Seminar account.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4"
              />

              Remember me
            </label>

            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;