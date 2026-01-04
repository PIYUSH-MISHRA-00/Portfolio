"use client";
import React from "react";
import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { resumeData } from "@/app/data/resume";
import { Folder, Github, ExternalLink, Code2 } from "lucide-react";

const Projects = () => {
    return (
        <Section id="projects" className="bg-dark-300">
            <div className="container px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-space)]">
                        Projects & <span className="text-neon-cyan">Publications</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        A selection of my work in AI, Data Science, and Software Development.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resumeData.projects.map((project, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative bg-dark-200 rounded-xl overflow-hidden border border-white/5 hover:border-neon-cyan/50 transition-all flex flex-col h-full"
                        >
                            <div className="p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <Folder size={40} className="text-neon-cyan group-hover:text-white transition-colors" />
                                    <div className="flex gap-4">
                                        {project.link && (
                                            <a href={project.link} target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                                <Github size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-neon-cyan transition-colors">{project.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {project.tech.map((tech) => (
                                        <span key={tech} className="text-xs font-mono text-gray-500 px-2 py-1 rounded bg-dark-300 border border-white/5">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default Projects;
