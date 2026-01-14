"use client";
import React from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Code, Database, Brain, Sparkles } from "lucide-react";
import Image from "next/image";

const About = () => {
    return (
        <Section id="about" className="bg-dark-300 relative">
            <div className="container px-6 mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-dark-200 border border-white/5 group shadow-2xl shadow-neon-blue/20">
                            {/* Placeholder for image - user can replace later or map to local image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 group-hover:opacity-0 transition-opacity z-10" />
                            <img
                                src="/Portfolio/pic/Me.jpeg"
                                alt="Piyush Mishra"
                                className="object-cover object-top w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-dark-200 rounded-xl border border-white/10 p-6 flex flex-col justify-center items-center backdrop-blur-md glass-panel">
                            <span className="text-5xl font-bold text-white mb-2 font-[family-name:var(--font-space)]">5+</span>
                            <span className="text-gray-400 text-sm uppercasetracking-wider text-center">Years of Experience</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-neon-cyan" />
                            <span className="text-neon-cyan font-mono text-sm">About Me</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 font-[family-name:var(--font-space)]">
                            Architecting <span className="text-gray-500">Intelligence</span>
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                            I am a passionate <span className="text-white font-medium">Data Scientist</span> and <span className="text-white font-medium">Generative AI Engineer</span> with a strong builder mindset.
                            My journey involves deep diving into Machine Learning research, scaling API infrastructure, and optimizing system performance.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            From building custom neural networks to deploying production-grade LLM applications, I thrive on solving complex problems. I combine academic rigor with practical engineering to deliver scalable AI solutions.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <Brain className="text-neon-violet mb-3" size={24} />
                                <h4 className="font-bold mb-1">Gen AI & NLP</h4>
                                <p className="text-sm text-gray-500">LLMs, RAG, Transformers</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <Database className="text-neon-blue mb-3" size={24} />
                                <h4 className="font-bold mb-1">Data Pipeline</h4>
                                <p className="text-sm text-gray-500">ETL, SQL, Vector DBs</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Section>
    );
};

export default About;
