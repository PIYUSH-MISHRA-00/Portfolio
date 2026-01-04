"use client";
import React from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Briefcase } from "lucide-react";

const Experience = () => {
    return (
        <Section id="experience" className="bg-dark-300">
            <div className="container px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-space)]">
                        Professional <span className="text-neon-violet">Journey</span>
                    </h2>
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon-violet/50 to-transparent" />

                    <div className="space-y-12">
                        {resumeData.experience.map((exp, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                                className={`relative flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-dark-300 border-2 border-neon-violet z-10 mt-1.5" />

                                {/* Content Card */}
                                <div className="ml-12 md:ml-0 md:w-1/2">
                                    <div className={`p-6 bg-dark-200 rounded-xl border border-white/5 hover:border-neon-violet/30 transition-colors ${idx % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={16} className="text-neon-violet" />
                                            <span className="text-sm text-neon-violet font-mono">{exp.duration}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{exp.role}</h3>
                                        <h4 className="text-lg text-gray-400 mb-4">{exp.company}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {exp.description}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <span className="text-xs text-gray-500">{exp.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Experience;
