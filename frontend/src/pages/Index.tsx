import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import TechStack from "../components/TechStack";
import Footer from "../components/Footer";
const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
