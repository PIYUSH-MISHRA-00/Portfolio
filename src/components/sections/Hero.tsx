"use client";
import React from "react";
import HeroScene from "@/components/3d/HeroScene";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-dot-white/[0.2]">
            <HeroScene />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-300/50 to-dark-300 z-0 pointer-events-none" />

            <div className="container relative z-10 px-6 mx-auto text-center md:text-left">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <h2 className="text-neon-cyan font-mono text-lg mb-4 tracking-wide">Hello, World! I am</h2>
                    <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-space)] mb-6 tracking-tight">
                        {resumeData.personal.name}
                    </h1>
                    <h2 className="text-2xl md:text-4xl text-gray-300 mb-8 font-light">
                        {resumeData.personal.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
                        {resumeData.personal.summary}
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <a
                            href="#projects"
                            className="px-8 py-3 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-full font-medium hover:bg-neon-cyan hover:text-dark-300 transition-all flex items-center gap-2 group"
                        >
                            View my Work <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-white/10 transition-all"
                        >
                            Contact Me
                        </a>
                    </div>

                    <div className="mt-12 flex items-center gap-6 justify-center md:justify-start">
                        <a href={resumeData.personal.social.github} target="_blank" className="text-gray-500 hover:text-white transition-colors"><Github size={24} /></a>
                        <a href={resumeData.personal.social.linkedin} target="_blank" className="text-gray-500 hover:text-neon-blue transition-colors"><Linkedin size={24} /></a>
                        <a href={`mailto:${resumeData.personal.email}`} className="text-gray-500 hover:text-neon-cyan transition-colors"><Mail size={24} /></a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
export default Hero;
