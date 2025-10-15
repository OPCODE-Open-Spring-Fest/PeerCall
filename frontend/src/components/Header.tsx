import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Menu, X } from "lucide-react";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-bold text-green-600 bg-clip-text"
          >
            PeerCall
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("tech-stack")}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium"
            >
              Tech Stack
            </button>
            <Button
              size="default"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => scrollToSection("join")}
            >
              Join Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-gray-900 hover:text-green-600 transition-colors font-medium py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("tech-stack")}
              className="block w-full text-left text-gray-900 hover:text-green-600 transition-colors font-medium py-2"
            >
              Tech Stack
            </button>
            <Button
              size="default"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => scrollToSection("join")}
            >
              Join Now
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
