"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, FileText, Menu, X, Youtube, Instagram } from "lucide-react";
import { resumeData } from "@/app/data/resume";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "About", href: "#about" },
        { name: "Skills", href: "#skills" },
        { name: "Experience", href: "#experience" },
        { name: "Projects", href: "#projects" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-dark-300/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold font-[family-name:var(--font-space)] tracking-tighter">
                    PM<span className="text-neon-cyan">.</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-300 hover:text-white hover:text-glow transition-all"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <a href={resumeData.personal.social.github} target="_blank" className="text-gray-400 hover:text-white transition-colors text-lg" title="GitHub"><i className="fab fa-github"></i></a>
                    <a href={resumeData.personal.social.linkedin} target="_blank" className="text-gray-400 hover:text-neon-blue transition-colors text-lg" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    <a href={resumeData.personal.social.youtube} target="_blank" className="text-gray-400 hover:text-red-500 transition-colors text-lg" title="YouTube"><i className="fab fa-youtube"></i></a>
                    <a href={resumeData.personal.social.instagram} target="_blank" className="text-gray-400 hover:text-pink-500 transition-colors text-lg" title="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href={resumeData.personal.social.twitter} target="_blank" className="text-gray-400 hover:text-blue-400 transition-colors text-lg" title="Twitter"><i className="fab fa-twitter"></i></a>
                    <a href={resumeData.personal.social.docker} target="_blank" className="text-gray-500 hover:text-blue-600 transition-colors text-lg" title="Docker"><i className="fab fa-docker"></i></a>
                    <a href={resumeData.personal.social.orcid} target="_blank" className="text-gray-500 hover:text-green-500 transition-colors text-lg" title="ORCID"><i className="fab fa-orcid"></i></a>
                    <a href={resumeData.personal.social.galiyaara} target="_blank" className="text-gray-500 hover:text-yellow-500 transition-colors text-lg" title="Galiyaara"><i className="fas fa-globe"></i></a>

                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <a
                        href={(resumeData.personal as any).resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium transition-all"
                    >
                        <FileText size={16} />
                        <span>Resume</span>
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden bg-dark-200 border-b border-white/10"
                >
                    <div className="px-6 py-8 flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-300"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center gap-6 mt-4">
                            <Github size={20} className="text-gray-400" />
                            <Linkedin size={20} className="text-gray-400" />
                            <Mail size={20} className="text-gray-400" />
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
