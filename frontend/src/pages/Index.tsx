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
    <div className="min-h-screen">
      <Header />
      <main>
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
