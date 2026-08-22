import { Link } from "react-router-dom";
import Button from "../components/Button/Button";

function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-gray-600">
            Join Wabi Seminar today.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5">

          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              placeholder="Create a password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
            />

            <span>
              I agree to the terms and conditions.
            </span>
          </label>

          <Button
            type="submit"
            className="w-full"
          >
            Create Account
          </Button>

        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;