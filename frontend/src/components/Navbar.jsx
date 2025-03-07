import  { useState } from 'react';
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const { isAuthenticated } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="w-full bg-[#92000b] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            className="h-12 w-auto object-contain"
            src={logo}
            alt="wings logo"
          />
        </div>

        {/* Navbar Links (Minimal) and Menu Icon */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-white relative py-2 group transition-all duration-300 hidden md:block">
            <span className="relative z-10">HOME</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="text-white relative py-2 group transition-all duration-300 hidden md:block"
          >
            <span className="relative z-10">{isAuthenticated ? "PROFILE" : "LOGIN"}</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>

          {/* Menu Icon to Toggle Drawer */}
          <button onClick={toggleDrawer} className="text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isDrawerOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#92000b] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          {/* Drawer Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">Menu</h2>
            <button onClick={toggleDrawer} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Drawer Links */}
          <Link
            to="/"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300 block md:hidden"
          >
            <span className="relative z-10">HOME</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/ngo"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">NGO</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/counsel"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">COUNSELLOR</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/maps"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">THREAT_TRACK</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/safeRoute"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">SAFEGO</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/all"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">PATH_FINDER</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/tips"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">GUARD_HER</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to="/report"
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300"
          >
            <span className="relative z-10">REPORT</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            onClick={toggleDrawer}
            className="text-white relative py-2 group transition-all duration-300 block md:hidden"
          >
            <span className="relative z-10">{isAuthenticated ? "PROFILE" : "LOGIN"}</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
        </div>
      </div>

      {/* Backdrop for Drawer (Optional) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleDrawer}
        ></div>
      )}
    </div>
  );
};

export default Navbar;