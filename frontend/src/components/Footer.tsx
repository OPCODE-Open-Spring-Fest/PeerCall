import { Github, FileText, Heart, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="join" className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-primary">
              PeerCall
            </h3>
            <p className="text-muted-foreground">
              Secure, privacy-respecting real-time video calls built with modern web technologies.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com/OPCODE-Open-Spring-Fest/PeerCall"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/OPCODE-Open-Spring-Fest/PeerCall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github size={16} />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OPCODE-Open-Spring-Fest/PeerCall/blob/main/.github/Contributor_Guide/Contributing.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart size={16} />
                  Contribution Guide
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OPCODE-Open-Spring-Fest/PeerCall/tree/main/.github/Contributor_Guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText size={16} />
                  MIT License
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Get Started</h4>
            <p className="text-muted-foreground mb-4">
              Ready to experience secure video calling?
            </p>
            <a
              href="#"
              className="inline-block bg-gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-card hover:shadow-glow"
            >
              Create Account
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} PeerCall. Built with <span className="text-primary">❤</span> for privacy
            and security.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
