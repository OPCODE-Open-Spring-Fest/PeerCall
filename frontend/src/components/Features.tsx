import { Shield, Video, MessageSquare, Smartphone, Lock, Users } from "lucide-react";
import { Card } from "./ui/card";

const features = [
  {
    icon: Shield,
    title: "Secure Sign-Up/Sign-In",
    description: "Advanced authentication with automatic token rotation to keep your account protected at all times.",
  },
  {
    icon: Video,
    title: "Peer-to-Peer Calls",
    description: "Direct WebRTC connections ensure crystal-clear audio and video without intermediary servers.",
  },
  {
    icon: MessageSquare,
    title: "In-Call Chat",
    description: "Real-time messaging overlay during calls for seamless communication and collaboration.",
  },
  {
    icon: Smartphone,
    title: "Device Management",
    description: "Manage all your connected devices and active sessions from a unified dashboard.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Military-grade encryption ensures your conversations remain completely private and secure.",
  },
  {
    icon: Users,
    title: "Session Management",
    description: "Complete control over your active sessions with instant revocation capabilities.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful{" "}
            <span className="text-green-600">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for secure, private video communication
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-block p-3 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
