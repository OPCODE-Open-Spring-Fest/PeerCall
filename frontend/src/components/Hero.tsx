import { Button } from "./ui/button";
import { ArrowRight, Play } from "lucide-react";
const Hero = () => {
  const scrollToJoin = () => {
    const element = document.getElementById("join");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10 animate-gradient-shift bg-[length:200%_200%]" />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-primary bg-clip-text bg-primary-foreground">
                Secure
              </span>{" "}
              <span className="text-foreground">
                Privacy-Respecting
              </span>{" "}
              <span className="text-foreground">
                Video Calls
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              PeerCall delivers secure, peer-to-peer WebRTC video communication with strong authentication and session management. Your privacy, our priority.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={scrollToJoin}
                className="group"
              >
                Join Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button variant="outline">
                <Play className="mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Secure</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">P2P</div>
                <div className="text-sm text-muted-foreground">Direct</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">E2E</div>
                <div className="text-sm text-muted-foreground">Encrypted</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevated mt-24">
              <img
                src="/bg3.png"
                alt="Secure video conferencing with PeerCall showing diverse team collaboration"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;