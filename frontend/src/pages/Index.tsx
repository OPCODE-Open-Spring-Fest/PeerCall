import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import TechStack from "../components/TechStack";
import Footer from "../components/Footer";
import ChatOverlay from "../components/ChatOverlay";
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
