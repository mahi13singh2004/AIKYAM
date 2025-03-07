import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";

const Counselor = () => {
  const [isListening, setIsListening] = useState(false);
  const { chat, isProcessing } = useAuthStore();
  const speechRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      speak("Sorry, your browser doesnt support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const voiceInput = event.results[0][0].transcript;
      console.log("User said:", voiceInput);
      setIsListening(false);
      await handleVoiceInput(voiceInput);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "no-speech") {
        speak("I didn’t hear anything. Please try again.");
      } else if (event.error === "aborted" || event.error === "audio-capture") {
        speak("Sorry, there was an issue with your microphone. Please check it and try again.");
      } else {
        speak("An error occurred. Please try again.");
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setIsListening(false);
        speak("Failed to start listening. Please try again.");
      }
    }
  };

  const handleVoiceInput = async (message) => {
    try {
      const aiResponse = await chat(message);
      console.log("AI response received:", aiResponse);
      if (typeof aiResponse !== "string") {
        console.error("Expected string, got:", aiResponse);
        speak("Sorry, there was an error with the response.");
        return;
      }
      speak(aiResponse);
    } catch (error) {
      console.error("Error processing voice input:", error);
      speak("Sorry, I couldn’t process that. Please try again.");
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    console.log("Speaking:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 2; 
    utterance.onend = () => {
      speechRef.current = null;
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      startRecognition();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-red-100">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-8">
        <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl 
              border-2 border-red-800/20 hover:border-red-800/30 
              transition-all duration-300 p-6 lg:p-8 flex flex-col items-center gap-4">
            <h2 className="text-xl lg:text-2xl font-bold text-red-800">AI Voice Counselor</h2>
            <p className="text-sm lg:text-base text-gray-600">
              {isListening ? "Listening..." : "Not Listening"} {isProcessing && "(Processing)"}
            </p>
            <div className="flex gap-4">
              <button
                onClick={toggleListening}
                className={`px-8 py-4 text-white text-lg font-semibold rounded-lg shadow-lg 
                  transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95
                  ${isListening 
                    ? "bg-gradient-to-r from-red-800 to-red-900" 
                    : "bg-gradient-to-r from-red-600 to-red-800"}`}
              >
                {isListening ? "Stop Listening" : "Start Listening"}
              </button>
              <button
                onClick={stopSpeaking}
                className="px-8 py-4 text-white text-lg font-semibold rounded-lg shadow-lg 
                  transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95
                  bg-gradient-to-r from-gray-600 to-gray-800"
              >
                Stop Speaking
              </button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 lg:p-6 
              border-2 border-red-800/20 hover:border-red-800/30 transition-all duration-300">
            <h2 className="text-xl lg:text-2xl font-bold text-red-800 mb-2">How It Works</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-lg lg:text-xl text-red-800">🤖</span>
                <p className="text-sm lg:text-base text-gray-700">Speak anytime, and our AI counselor will respond with guidance</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg lg:text-xl text-red-800">🔒</span>
                <p className="text-sm lg:text-base text-gray-700">Your conversations are completely private and secure</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 lg:p-6 
              border-2 border-red-800/20 hover:border-red-800/30 transition-all duration-300">
            <h2 className="text-xl lg:text-2xl font-bold text-red-800 mb-4">Important Notice</h2>
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm lg:text-base text-gray-700">
                This is an AI-powered voice service. While it can provide support and guidance,
                please do not rely solely on it for medical or emergency situations.
              </p>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-lg lg:text-xl font-semibold text-red-800">Emergency Numbers</h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg">
                  <span className="text-sm lg:text-base font-medium text-gray-700">Medical Emergency</span>
                  <span className="text-sm lg:text-base font-bold text-red-800">112</span>
                </div>
                <div className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg">
                  <span className="text-sm lg:text-base font-medium text-gray-700">Women Helpline</span>
                  <span className="text-sm lg:text-base font-bold text-red-800">1091</span>
                </div>
                <div className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg">
                  <span className="text-sm lg:text-base font-medium text-gray-700">Police</span>
                  <span className="text-sm lg:text-base font-bold text-red-800">100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counselor;