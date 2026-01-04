"use client";
import React from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Award, GraduationCap, FileCheck } from "lucide-react";

const AchievementsEducation = () => {
    return (
        <Section id="achievements" className="bg-dark-200">
            <div className="container px-6 mx-auto">
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Achievements & Certifications */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-8 flex items-center gap-3"
                        >
                            <Award className="text-neon-violet" size={32} />
                            <h2 className="text-3xl font-bold font-[family-name:var(--font-space)]">
                                Awards & <span className="text-neon-violet">Certifications</span>
                            </h2>
                        </motion.div>

                        <div className="space-y-6">
                            {resumeData.awards.map((award, idx) => (
                                <motion.div
                                    key={`award-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-4 items-start p-4 bg-white/5 rounded-lg border border-white/5 hover:border-gold/30 transition-colors"
                                >
                                    <div className="mt-1 min-w-[20px] text-yellow-500">★</div>
                                    <p className="text-gray-300">{award}</p>
                                </motion.div>
                            ))}

                            <div className="h-px bg-white/10 my-8" />

                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FileCheck className="text-neon-cyan" /> Certifications
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {resumeData.certifications.map((cert, idx) => (
                                    <motion.span
                                        key={`cert-${idx}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        viewport={{ once: true }}
                                        className="px-3 py-1.5 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded text-sm"
                                    >
                                        {cert}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-8 flex items-center gap-3"
                        >
                            <GraduationCap className="text-neon-blue" size={32} />
                            <h2 className="text-3xl font-bold font-[family-name:var(--font-space)]">
                                Education <span className="text-neon-blue">History</span>
                            </h2>
                        </motion.div>

                        <div className="relative border-l border-white/10 ml-3 space-y-12">
                            {resumeData.education.map((edu, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.2 }}
                                    viewport={{ once: true }}
                                    className="relative pl-8"
                                >
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-neon-blue" />
                                    <span className="text-sm text-neon-blue font-mono mb-2 block">{edu.year}</span>
                                    <h3 className="text-xl font-bold text-white">{edu.school}</h3>
                                    <p className="text-gray-400 mb-1">{edu.degree}</p>
                                    <p className="text-sm text-gray-500">{edu.grade}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default AchievementsEducation;
