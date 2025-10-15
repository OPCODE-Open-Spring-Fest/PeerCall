import { Code2, Server, Database, Palette } from "lucide-react";
import { Card } from "./ui/card";

const techCategories = [
  {
    icon: Code2,
    title: "Frontend",
    technologies: ["React", "TypeScript", "Tailwind CSS", "WebRTC"],
  },
  {
    icon: Server,
    title: "Backend",
    technologies: ["Node.js", "Express", "JWT"],
  },
  {
    icon: Database,
    title: "Database",
    technologies: ["MongoDB", "PostgreSQL"],
  },
  {
    icon: Palette,
    title: "Design",
    technologies: ["Responsive UI", "Modern UX", "Animations", "Accessibility"],
  },
];

const TechStack = () => {
  return (
    <section id="tech-stack" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built With{" "}
            <span className="text-green-600">
              Modern Tech
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leveraging cutting-edge technologies for optimal performance and security
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techCategories.map((category, index) => (
            <Card
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-block p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-all">
                <category.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.technologies.map((tech, techIndex) => (
                  <li
                    key={techIndex}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    {tech}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
