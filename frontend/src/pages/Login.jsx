import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import loginPhoto from "../assets/login.jpg"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password)
      navigate("/")
    }
    catch (error) {
      console.log("Error in login", error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#92000b] p-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-4 md:p-8 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-6">
            LOGIN
          </h1>

          <form className="flex flex-col w-full" onSubmit={handleLogin}>
            <input
              type="email"
              className="border border-red-500 p-2 md:p-3 mb-4 md:mb-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />

            <input
              type="password"
              className="border border-red-500 p-2 md:p-3 mb-4 md:mb-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />

            
            <button
              type="submit"
              className="bg-red-600 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              LOGIN
            </button>
          </form>

          <div className="mt-5 md:mt-7 text-center">
            <p className="text-base md:text-lg font-medium text-gray-800">
              New here?
              <a
                href="/signup"
                className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 relative inline-block ml-1 transition-all duration-300 ease-in-out"
              >
                Register
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-red-700 scale-x-0 transition-transform duration-300 ease-in-out origin-left hover:scale-x-100"></span>
              </a>
            </p>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 justify-center items-center">
          <img
            src={loginPhoto}
            alt="Login Illustration"
            className="w-full h-auto object-cover rounded-r-4xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
