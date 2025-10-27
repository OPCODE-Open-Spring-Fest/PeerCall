import { useState, useEffect } from "react";
import { Button } from "../components/ui/button.js";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import axios from "axios";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ _id: string; name: string } | null>(null);
  const navigate = useNavigate();

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Scroll to section smoothly
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleJoinNow = () => {
    if (!user) navigate("/signin");
    else navigate("/room-actions");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav
  className={`flex items-center justify-between w-full px-4 sm:px-6 py-3 md:py-4 max-w-[100vw] mx-auto`}
>
  {/* Logo aligned to extreme left */}
  <a
    href="/"
    className="text-2xl md:text-3xl font-extrabold text-green-600 tracking-tight"
  >
    PeerCall
  </a>

  {/* Desktop Navigation */}
  <div className="hidden md:flex items-center gap-8">
    <button
      onClick={() => scrollToSection("features")}
      className="text-gray-800 hover:text-green-600 transition-colors font-medium"
    >
      Features
    </button>
    <button
      onClick={() => scrollToSection("tech-stack")}
      className="text-gray-800 hover:text-green-600 transition-colors font-medium"
    >
      Tech Stack
    </button>

    {user ? (
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
          Hi, {user.name.split(" ")[0]}
        </span>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          Logout
        </Button>
      </div>
    ) : (
      <Button
        onClick={handleJoinNow}
        className="bg-green-600 text-white hover:bg-green-700"
      >
        Join Now
      </Button>
    )}
  </div>

  {/* Mobile Menu Button */}
  <button
    className="md:hidden text-gray-800 focus:outline-none"
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    aria-label="Toggle menu"
  >
    {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
  </button>
</nav>


      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg transform transition-all duration-300 origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-y-100 visible"
            : "opacity-0 scale-y-0 invisible"
        }`}
      >
        <div className="flex flex-col px-6 py-4 space-y-4">
          <button
            onClick={() => scrollToSection("features")}
            className="text-gray-800 hover:text-green-600 text-lg text-left font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("tech-stack")}
            className="text-gray-800 hover:text-green-600 text-lg text-left font-medium"
          >
            Tech Stack
          </button>

          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                Hello, {user.name.split(" ")[0]}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={handleJoinNow}
              className="bg-green-600 text-white hover:bg-green-700 w-full"
            >
              Join Now
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
