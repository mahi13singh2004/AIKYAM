import logo from "../assets/logo.jpg";
import cave from "../assets/cave.jpg";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ReactTyped } from "react-typed";
import Card from "../components/Card";
import features from "../data/Features";
import strings from "../data/Typing";
import { useState } from "react";


export const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToFeatures = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-[#92000b] flex flex-col items-center md:items-start py-4 md:py-0 min-h-[60vh] md:min-h-screen">
          <div className="px-8 flex items-center justify-between w-full md:justify-start gap-5">
            <img
              className="h-16 md:h-32 w-auto object-contain"
              src={logo}
              alt="wings logo"
            />
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden w-full bg-[#92000b] py-4 px-8">
              <div className="flex flex-col gap-4">
                <Link to="/" className="text-white text-lg">
                  HOME
                </Link>
                <Link to="/ngo" className="text-white text-lg">
                  NGO
                </Link>
                <Link to="/counsel" className="text-white text-lg">
                  COUNSELLOR
                </Link>
                <Link to="/maps" className="text-white text-lg">
                  MAPS
                </Link>
                <Link
                  to={isAuthenticated ? "/profile" : "/login"}
                  className="text-white text-lg"
                >
                  {isAuthenticated ? "PROFILE" : "LOGIN"}
                </Link>
              </div>
            </div>
          )}

          <div className="text-white px-4 md:px-8 mt-6 md:mt-20 text-center md:text-left flex-grow flex flex-col">
            <div className="flex flex-col justify-center flex-grow">
              <h1 className="text-3xl md:text-7xl font-bold mb-4 leading-tight">
                Safety at your fingertips - <br className="hidden md:block" /> anytime, anywhere.
              </h1>

              <div className="text-lg md:text-2xl mb-6 min-h-[80px] md:min-h-[96px]">
                <ReactTyped
                  strings={strings}
                  typeSpeed={40}
                  backSpeed={40}
                  backDelay={1000}
                  loop
                  smartBackspace
                />
              </div>
            </div>

            <div className="flex justify-center md:justify-start">
              <button
                onClick={scrollToFeatures}
                className="bg-gradient-to-r from-red-600 to-red-800 text-white px-5 md:px-8 py-2 md:py-3 
                 rounded-lg font-semibold shadow-lg transform transition-all 
                 duration-300 hover:scale-105 hover:shadow-xl mb-8 md:mb-12
                 hover:from-red-700 hover:to-red-900 active:scale-95 text-sm md:text-base"
              >
                Learn more →
              </button>
            </div>
          </div>
        </div>

        <div className="w-full min-h-[60vh] md:min-h-screen md:w-1/2 relative">
          <img
            className="w-full h-full object-cover"
            src={cave}
            alt="cave"
          />

          <div className="nav-links hidden md:flex justify-end gap-10 px-8 py-6 absolute top-0 right-0 z-10 text-xl items-center">
            <Link to="/" className="text-white relative py-2 group transition-all duration-300">
              <span className="relative z-10">HOME</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
            <Link to="/ngo" className="text-white relative py-2 group transition-all duration-300">
              <span className="relative z-10">NGO</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
            <Link to="/counsel" className="text-white relative py-2 group transition-all duration-300">
              <span className="relative z-10">COUNSELLOR</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="text-white relative py-2 group transition-all duration-300"
            >
              <span className="relative z-10">{isAuthenticated ? "PROFILE" : "LOGIN"}</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
          </div>
        </div>
      </div>

      <div className="features min-h-screen bg-white py-16 px-10">
        <h2 id="features" className="text-4xl font-bold text-center text-red-800 mb-12">
          FEATURES
        </h2>

        <div className="flex gap-30 flex-wrap items-center justify-center">
          {features.map((feature, index) => (
            <Card key={index} image={feature.image} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>

      {/* <div className="features min-h-[80vh] bg-white py-8 md:py-12 px-4 md:px-10"> */}
        {/* <h2 className="text-3xl md:text-4xl font-bold text-center text-red-800 mb-8 md:mb-12">
          BETA USERS
        </h2> */}

        {/* <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 md:p-8 border-2 border-red-800/30 hover:border-red-800/50 transition-all duration-300"> */}
          {/* <Slider
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            arrows={false}
            autoplay={true}
            autoplaySpeed={2000}
            className="review-slider"
          >
            {[
              {
                image: sister1,
                name: "Shruti Singh",
                review: "Tested the platform, and its both intuitive and effective. The features are well-designed and can truly help those in need of quick support and safety",
              },
              {
                image: sister2,
                name: "Shraddha Dhaundiyal",
                review: "It's still in the early stages, but it looks promising. The voice feature is especially useful, and the UI feels sleek and intuitive.",
              },
            ].map((review, index) => (
              <div key={index} className="px-4 md:px-8 text-center">
                <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-4 md:mb-8">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full rounded-full object-cover border-4 border-red-800 shadow-lg"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-red-800">{review.name}</h3>
                <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  {review.review}
                </p>
              </div>
            ))}
          </Slider> */}
        {/* </div> */}
      {/* </div> */}

      <div className="py-4 md:py-8 px-4 md:px-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        <div className="w-full md:w-1/2 h-[200px] md:h-[300px] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
          <img
            src="https://img.freepik.com/free-vector/online-education-concept_52683-8287.jpg?ga=GA1.1.906515664.1738859704&semt=ais_hybrid"
            alt="Mobile app preview"
            className="w-full h-full object-contain bg-white"
          />
        </div>

        <div className="w-full md:w-1/2 space-y-4 md:space-y-6 max-w-xl text-black text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3 md:mb-5">
            Try Our App
          </h1>
          <p className="text-lg md:text-xl text-black leading-relaxed mb-3 md:mb-5">
            We are working at full speed to bring you an exceptional mobile experience. Our app will soon be available for beta testing and on the Play Store.
          </p>
          <p className="text-xl md:text-2xl font-semibold text-red-500">
            Hang Tight! Something amazing is coming...
          </p>
        </div>
      </div>
    </>
  );
};
