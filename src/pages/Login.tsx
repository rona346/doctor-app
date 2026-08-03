import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";

export default function Login() {

  const {
  user,
  login,
  loginWithEmail,
  signupWithEmail,
  resetPassword,
  isLoggingIn,
} = useAuth();


  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  
  useEffect(() => {
  if (!user) return;

  if (user.role === "admin") {
    navigate("/admin/dashboard");
  } else if (user.role === "doctor") {
    navigate("/doctor/dashboard");
  } else {
    navigate("/patient/dashboard");
  }
}, [user, navigate]);

  const handleEmailLogin = async () => {

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }  

  try {
    await loginWithEmail(email, password);
    navigate("/");
  } catch (error) {
    console.error(error);
    alert("Invalid email or password");
  }
};

const handleSignup = async () => {
  
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }
  try {
    await signupWithEmail(
      name,
      email,
      password,
      "patient"
    );

    navigate("/");
  } catch (error) {
    console.error(error);
    alert("Signup failed");
  }
};

const handleForgotPassword = async () => {
  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  try {
    await resetPassword(email);
    alert("Password reset email sent.");
  } catch (error) {
    console.error(error);
    alert("Failed to send reset email.");
  }
};

return (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
    <div className="bg-white w-[420px] rounded-3xl shadow-xl p-10">

     <h1 className="text-3xl font-serif text-center mb-8">
       {isSignup ? "Create Account" : "Welcome Back"}
     </h1>
      
      {isSignup && (
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-stone-500"
        />
      )}

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-stone-500"
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-xl p-3 mb-6 outline-none focus:ring-2 focus:ring-stone-500"
      />

      {!isSignup && (
      <button
        onClick={handleForgotPassword}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        Forgot Password?
      </button>
      )}


      {/* Email Login */}
      <button
        onClick={isSignup ? handleSignup : handleEmailLogin}
        className="w-full bg-stone-900 text-white py-3 rounded-xl hover:bg-stone-800"
      >
        {isSignup ? "Create Account" : "Login"}
      </button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t"></div>
        <span className="px-3 text-stone-500">OR</span>
        <div className="flex-1 border-t"></div>
      </div>

      {/* Google Login */}
      <button
        onClick={login}
        disabled={isLoggingIn}
        className="w-full border py-3 rounded-xl hover:bg-stone-100 flex items-center justify-center gap-3"
      >
        <FcGoogle size={22} />
        {isLoggingIn ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="text-center mt-6">
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="text-stone-600 hover:underline"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </button>
      </div>

    </div>
  </div>
);
}