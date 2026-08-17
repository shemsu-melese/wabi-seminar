// import { Link } from "react-router-dom";

// function RegisterPage() {
//   function handleSubmit(event) {
//     event.preventDefault();

//     console.log("Registration submitted");
//   }

//   return (
//     <main className="register-page">
//       <section className="register-card">
//         <div className="register-header">
//           <h1>Create your account</h1>

//           <p>
//             Join our modern online meeting platform.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="register-form">
//           <div className="form-group">
//             <label htmlFor="fullName">
//               Full Name
//             </label>

//             <input
//               id="fullName"
//               name="fullName"
//               type="text"
//               placeholder="Enter your full name"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="email">
//               Email Address
//             </label>

//             <input
//               id="email"
//               name="email"
//               type="email"
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">
//               Password
//             </label>

//             <input
//               id="password"
//               name="password"
//               type="password"
//               placeholder="Create a password"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="confirmPassword">
//               Confirm Password
//             </label>

//             <input
//               id="confirmPassword"
//               name="confirmPassword"
//               type="password"
//               placeholder="Confirm your password"
//               required
//             />
//           </div>

//           <button type="submit">
//             Create Account
//           </button>
//         </form>

//         <div className="register-footer">
//           <p>
//             Already have an account?
//           </p>

//           <Link to="/login">
//             Login
//           </Link>
//         </div>

//         <div className="back-home">
//           <Link to="/">
//             ← Back to Home
//           </Link>
//         </div>
//       </section>
//     </main>
//   );
// }

// export default RegisterPage;