import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.log("Error in logout", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-xl font-semibold">Loading user data...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-red-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-8">
        <div className="w-full md:w-1/2 flex justify-center items-center p-4">
          <img
            src="https://img.freepik.com/free-vector/boy-with-smartphone-social-profile-commnication_24877-53919.jpg"
            alt="Profile Illustration"
            className="w-full max-w-md rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center p-4">
          <div className="bg-white/90 backdrop-blur-sm w-full max-w-md rounded-2xl shadow-2xl p-8 
                        border-2 border-red-800/20 hover:border-red-800/30 transition-all duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-red-800 mb-2">Welcome Back!</h1>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50/50 p-4 rounded-lg hover:bg-red-50 transition-colors duration-300">
                <p className="text-sm text-red-800 font-semibold mb-1">NAME</p>
                <p className="text-lg text-gray-700 font-medium">{user.name}</p>
              </div>

              <div className="bg-red-50/50 p-4 rounded-lg hover:bg-red-50 transition-colors duration-300">
                <p className="text-sm text-red-800 font-semibold mb-1">EMAIL</p>
                <p className="text-lg text-gray-700 font-medium">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 
                      rounded-lg font-semibold shadow-lg transform transition-all duration-300 
                      hover:scale-105 hover:shadow-xl hover:from-red-700 hover:to-red-900 
                      active:scale-95"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
