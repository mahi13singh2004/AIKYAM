import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import Navbar from '../components/Navbar';
import bgvideo from "../assets/video.mp4";

const Tips = () => {
    const tipsRef = useRef(null);
    const [selectedState, setSelectedState] = useState('Karnataka');

    const safetyTips = [
        {
            title: "Stay Alert",
            icon: "👁",
            description: "Always be aware of your surroundings",
            details: "Keep your head up, observe your environment, and trust your instincts."
        },
        {
            title: "Share Location",
            icon: "📍",
            description: "Keep trusted contacts informed",
            details: "Share your live location with family or friends during travels."
        },
        {
            title: "Emergency Contacts",
            icon: "📱",
            description: "Quick access to help",
            details: "Save ICE (In Case of Emergency) contacts. Add emergency numbers to your phone's speed dial."
        },
        {
            title: "Safe Transport",
            icon: "🚗",
            description: "Verified ride services",
            details: "Use registered taxi services, keep photo of vehicle number, share ride details with trusted contacts."
        },
        {
            title: "Digital Safety",
            icon: "🔒",
            description: "Protect your online presence",
            details: "Use strong passwords, enable two-factor authentication, be careful with personal information sharing."
        },
        {
            title: "Self Defense",
            icon: "💪",
            description: "Basic protection skills",
            details: "Learn basic self-defense moves, carry personal safety devices like pepper spray where legal."
        },
        {
            title: "Public Safety",
            icon: "🚶‍♀",
            description: "Navigate public spaces safely",
            details: "Stick to well-lit areas, avoid isolated places, and walk confidently."
        },
        {
            title: "Travel Smart",
            icon: "✈",
            description: "Safe travel practices",
            details: "Research destinations, keep documents secure, and stay connected with family."
        },
        {
            title: "Home Security",
            icon: "🏠",
            description: "Secure your living space",
            details: "Install good locks, maintain exterior lighting, and know your neighbors."
        },
        {
            title: "Workplace Safety",
            icon: "💼",
            description: "Stay safe at work",
            details: "Know workplace security protocols and emergency exits. Park in well-lit areas."
        },
        {
            title: "Night Safety",
            icon: "🌙",
            description: "Extra caution after dark",
            details: "Use well-lit routes, avoid distractions while walking, keep keys ready."
        },
        {
            title: "Social Safety",
            icon: "👥",
            description: "Safe social interactions",
            details: "Meet new people in public places, trust your instincts about uncomfortable situations."
        }
    ];

    const stateEmergencyContacts = {
        Karnataka: {
            police: '112',
            ambulance: '108',
            women_helpline: '181',
        },
        Maharashtra: {
            police: '100',
            ambulance: '108',
            women_helpline: '103',
        },
        Kerala: {
            police: '100',
            ambulance: '108',
            women_helpline: '181',
        },
        Delhi: {
            police: '100',
            ambulance: '102',
            women_helpline: '181',
        },
        'Tamil Nadu': {
            police: '100',
            ambulance: '108',
            women_helpline: '181',
        }
    };

    const stateCoordinates = {
        Karnataka: { north: 18.4, south: 11.6, east: 78.6, west: 74.0 },
        Maharashtra: { north: 22.1, south: 15.6, east: 80.9, west: 72.6 },
        Kerala: { north: 12.8, south: 8.3, east: 77.4, west: 74.9 },
        Delhi: { north: 28.88, south: 28.4, east: 77.35, west: 76.83 },
        'Tamil Nadu': { north: 13.5, south: 8.1, east: 80.3, west: 76.7 }
    };

    const getStateFromCoordinates = (lat, lng) => {
        for (const [state, bounds] of Object.entries(stateCoordinates)) {
            if (lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west) {
                return state;
            }
        }
        return 'Karnataka';
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const detectedState = getStateFromCoordinates(latitude, longitude);
                    console.log("Detected State:", detectedState);
                    setSelectedState(detectedState);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setSelectedState('Karnataka');
                }
            );
        } else {
            console.error("Geolocation not supported by browser");
            setSelectedState('Karnataka');
        }
    }, []);

    const scrollToTips = () => {
        tipsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <Navbar />
            <div className="relative min-h-screen bg-white text-black">
                {/* Hero Section */}
                <div className="relative h-screen flex items-center overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ zIndex: 0 }}
                    >
                        <source src={bgvideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }}></div>
                    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative" style={{ zIndex: 2 }}>
                        <div className="max-w-4xl">
                            <h1 className="text-12xl md:text-8xl font-extrabold mb-6 text-white">
                                <Typewriter
                                    options={{
                                        strings: ['Safety First', 'Stay Protected', 'Be Prepared'],
                                        autoStart: true,
                                        loop: true,
                                        delay: 75,
                                        deleteSpeed: 50,
                                    }}
                                />
                            </h1>
                            <p className="text-2xl md:text-3xl mb-8 text-white font-semibold">
                                Empowering women with safety resources and information
                            </p>
                            <motion.button
                                onClick={scrollToTips}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-red-600 text-black px-8 py-3 rounded-full font-semibold transition-colors"
                            >
                                Learn More
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Safety Tips Section */}
                <section ref={tipsRef} className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Essential Safety Tips</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {safetyTips.map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group [perspective:1000px]"
                                >
                                    <div className="relative transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                        <div className="relative bg-white rounded-2xl p-8 border border-gray-200 [backface-visibility:hidden]">
                                            <div className="text-4xl mb-4">{tip.icon}</div>
                                            <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                                            <p className="text-gray-600">{tip.description}</p>
                                        </div>
                                        <div className="absolute inset-0 h-full w-full bg-white rounded-2xl p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                            <div className="h-full flex flex-col justify-center">
                                                <p className="text-black">{tip.details}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Emergency Contacts Section */}
                <section className="py-20 bg-gray-100">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Emergency Contacts</h2>
                        <h3 className="text-2xl text-center mb-12">
                            Emergency numbers for <span className="text-red-600 font-bold">{selectedState}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white hover:bg-red-600 rounded-2xl p-8 border border-gray-200 shadow-lg group transition-colors duration-300"
                            >
                                <div className="text-4xl mb-4 group-hover:text-white">👮‍♀️</div>
                                <h3 className="text-xl font-semibold mb-4 text-black group-hover:text-white">Police Emergency</h3>
                                <p className="text-3xl font-bold text-black group-hover:text-white">{stateEmergencyContacts[selectedState].police}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white hover:bg-red-600 rounded-2xl p-8 border border-gray-200 shadow-lg group transition-colors duration-300"
                            >
                                <div className="text-4xl mb-4 group-hover:text-white">🚑</div>
                                <h3 className="text-xl font-semibold mb-4 text-black group-hover:text-white">Medical Emergency</h3>
                                <p className="text-3xl font-bold text-black group-hover:text-white">{stateEmergencyContacts[selectedState].ambulance}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white hover:bg-red-600 rounded-2xl p-8 border border-gray-200 shadow-lg group transition-colors duration-300"
                            >
                                <div className="text-4xl mb-4 group-hover:text-white">🆘</div>
                                <h3 className="text-xl font-semibold mb-4 text-black group-hover:text-white">Womens Helpline</h3>
                                <p className="text-3xl font-bold text-black group-hover:text-white">{stateEmergencyContacts[selectedState].women_helpline}</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Tips;