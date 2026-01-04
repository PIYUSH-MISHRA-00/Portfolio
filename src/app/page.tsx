import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import AchievementsEducation from "@/components/sections/AchievementsEducation";
import Contact from "@/components/sections/Contact";

export default function Home() {
    return (
        <main className="bg-dark-300 min-h-screen text-white overflow-x-hidden selection:bg-neon-cyan/30">
            <Navbar />
            <Hero />
            <About />
            <Skills />
            <Experience />
            <Projects />
            <AchievementsEducation />
            <Contact />
        </main>
    );
}
