"use client";
import React from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Cpu, Cloud, Code2, Terminal, Layers } from "lucide-react";

const Skills = () => {
    const categories = [
        { name: "Languages", icon: Code2, skills: resumeData.skills.languages },
        { name: "AI & ML", icon: BrainIcon, skills: resumeData.skills.ai },
        { name: "Frameworks", icon: Layers, skills: resumeData.skills.frameworks },
        { name: "Cloud & Ops", icon: Cloud, skills: resumeData.skills.cloud },
        { name: "Tools", icon: Terminal, skills: resumeData.skills.tools },
    ];

    return (
        <Section id="skills" className="bg-dark-200">
            <div className="container px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-space)]">
                        Technical <span className="text-neon-blue">Arsenal</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group p-8 bg-white/5 rounded-2xl border border-white/5 hover:border-neon-blue/50 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/5 rounded-lg text-neon-cyan group-hover:bg-neon-blue group-hover:text-white transition-colors">
                                    <cat.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold">{cat.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {cat.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-black/40 rounded-full text-sm text-gray-300 border border-white/5">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

function BrainIcon({ size, className }: { size?: number, className?: string }) {
    return <Cpu size={size} className={className} />
}

export default Skills;
