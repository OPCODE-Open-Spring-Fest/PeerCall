import { Button } from "./ui/button.js";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleJoinNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data?.user) {
        navigate("/room-actions");
      } else {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gray-50 text-gray-900">
      {/* Animated Background */}
  <div className="absolute inset-0 bg-linear-to-br from-green-500 via-pink-200 to-blue-500 opacity-10 animate-gradient-shift bg-size-[200%_200%]" />
      {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-linear-to-b from-gray-50/50 via-gray-50/80 to-gray-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center mb-24 lg:text-left animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-green-700">Secure</span>{" "}
              <span className="text-gray-900">Privacy-Respecting</span>{" "}
              <span className="text-gray-900">Video Calls</span>
            </h1>

            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto lg:mx-0">
              PeerCall delivers secure, peer-to-peer WebRTC video communication with strong authentication and session management. Your privacy, our priority.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={handleJoinNow} disabled={loading} className="group bg-green-700 text-white hover:bg-purple-700">
                {loading ? 'Checking...' : 'Join Now'}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-100">
                <Play className="mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/*Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl mt-24">
              <img
                src="/bg3.png"
                alt="Secure video conferencing with PeerCall showing diverse team collaboration"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
