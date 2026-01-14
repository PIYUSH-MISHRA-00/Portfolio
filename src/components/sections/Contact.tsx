"use client";
import React, { useState } from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Mail, MapPin, Copy, Check, Github, Linkedin, Youtube, Instagram, Twitter, Box, Fingerprint, Globe } from "lucide-react";

const Contact = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(resumeData.personal.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <footer className="bg-dark-300 pt-20 pb-10 border-t border-white/5">
            <Section id="contact" className="!py-0">
                <div className="container px-6 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-space)]"
                        >
                            Let's Build the <span className="text-neon-cyan">Future</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-gray-400 text-lg mb-10"
                        >
                            Open to opportunities in Generative AI, MLOps, and Data Science.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row gap-6 justify-center items-center"
                        >
                            <button
                                onClick={handleCopy}
                                className="group flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all w-full md:w-auto justify-center overflow-hidden"
                            >
                                <Mail className="text-neon-violet flex-shrink-0" />
                                <span className="text-gray-200 truncate max-w-[200px] md:max-w-none">{resumeData.personal.email}</span>
                                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-500 group-hover:text-white" />}
                            </button>
                            <div className="flex items-center gap-3 px-6 py-4 bg-transparent border border-white/5 rounded-xl text-gray-400">
                                <MapPin className="text-neon-blue" />
                                <span>{resumeData.personal.location}</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-white/5 gap-4">
                        <div className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} {resumeData.personal.name}. All rights reserved.
                        </div>
                        <div className="flex flex-wrap items-center gap-6 justify-center md:justify-end">
                            <a href={resumeData.personal.social.github} target="_blank" className="text-gray-500 hover:text-white transition-colors text-2xl" title="GitHub"><i className="fab fa-github"></i></a>
                            <a href={resumeData.personal.social.linkedin} target="_blank" className="text-gray-500 hover:text-neon-blue transition-colors text-2xl" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href={resumeData.personal.social.youtube} target="_blank" className="text-gray-500 hover:text-red-500 transition-colors text-2xl" title="YouTube"><i className="fab fa-youtube"></i></a>
                            <a href={resumeData.personal.social.instagram} target="_blank" className="text-gray-500 hover:text-pink-500 transition-colors text-2xl" title="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href={resumeData.personal.social.twitter} target="_blank" className="text-gray-500 hover:text-blue-400 transition-colors text-2xl" title="X (Twitter)"><i className="fab fa-twitter"></i></a>
                            <a href={resumeData.personal.social.docker} target="_blank" className="text-gray-500 hover:text-blue-600 transition-colors text-2xl" title="Docker"><i className="fab fa-docker"></i></a>
                            <a href={resumeData.personal.social.orcid} target="_blank" className="text-gray-500 hover:text-green-500 transition-colors text-2xl" title="ORCID"><i className="fab fa-orcid"></i></a>
                            <a href={resumeData.personal.social.galiyaara} target="_blank" className="text-gray-500 hover:text-yellow-500 transition-colors text-2xl" title="Galiyaara"><i className="fas fa-globe"></i></a>
                            <a href={`mailto:${resumeData.personal.email}`} className="text-gray-500 hover:text-neon-cyan transition-colors text-2xl" title="Email"><i className="fas fa-envelope"></i></a>
                        </div>
                    </div>
                </div>
            </Section>
        </footer>
    );
};

export default Contact;
