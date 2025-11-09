import Header from "../components/Header.js";
import Hero from "../components/Hero.js";
import Features from "../components/Features.js";
import TechStack from "../components/TechStack.js";
import Footer from "../components/Footer.js";
import ChatOverlay from "../components/ChatOverlay.js";
import "../index.css";

const Index = () => {
  const callRoomId = "demo-room-123";
  const currentUser = "Demo User";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main className="bg-gray-50 dark:bg-gray-950 transition-colors">
        <Hero />
        <Features />
        <TechStack />
      </main>
      <ChatOverlay roomId={callRoomId} userName={currentUser} />
      <Footer />
    </div>
  );
};

export default Index;
