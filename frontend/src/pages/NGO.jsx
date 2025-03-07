import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ngos from "../data/NgoList.jsx";

const uniqueLocations = [...new Set(ngos.map((ngo) => ngo.location))];

const NGO = () => {
  const [search, setSearch] = useState("");
  const [filteredNGOs, setFilteredNGOs] = useState([]);
  const resultsRef = useRef(null);

  const handleSearch = () => {
    if (search) {
      const results = ngos.filter((ngo) => ngo.location === search);
      setFilteredNGOs(results);
      
 
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-red-100">
      <Navbar />

      <div className="flex-1 flex flex-col items-center px-4 py-8">
    
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
     
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-red-800 leading-tight">
              Connect With NGOs <br />That Make a Difference
            </h1>
            <p className="text-lg text-gray-700">
              Find and connect with trusted NGOs in your area. Together, we can create positive change.
            </p>
          </div>

     
          <div className="w-full md:w-1/2">
            <img
              src="https://img.freepik.com/free-vector/brainstorming-concept-landing-page_52683-25791.jpg"
              alt="NGO Support"
              className="w-full rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

      
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 
                      border-2 border-red-800/20 hover:border-red-800/30 transition-all duration-300 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              className="flex-1 p-3 rounded-lg border-2 border-red-800/20 bg-white/90 
                       focus:border-red-800/40 focus:outline-none text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            >
              <option value="">Select Location</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <button
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white 
                       font-semibold rounded-lg shadow-lg transform transition-all duration-300 
                       hover:scale-105 hover:shadow-xl hover:from-red-700 hover:to-red-900 
                       active:scale-95"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

   
        <div 
          ref={resultsRef} 
          className="w-full max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNGOs.length > 0 ? (
            filteredNGOs.map((ngo) => (
              <motion.div
                key={ngo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl 
                         border-2 border-red-800/20 hover:border-red-800/30 
                         transition-all duration-300 hover:shadow-2xl"
              >
                <img
                  src={ngo.image}
                  alt={ngo.name}
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold text-red-800 mb-2">{ngo.name}</h2>
                <p className="text-gray-600 mb-2">📍 {ngo.location}</p>
                <p className="text-gray-700 font-semibold mb-2">📞 {ngo.contact}</p>
                {ngo.website && (
                  <a
                    href={ngo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-800 hover:text-red-600 font-semibold 
                             transition-colors duration-300"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-xl text-gray-600 text-center col-span-full">
              Please select a location to find NGOs in your area.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGO;