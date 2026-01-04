import React from "react";
import clsx from "clsx";

interface SectionProps {
    id?: string;
    className?: string;
    children: React.ReactNode;
}

const Section = ({ id, className, children }: SectionProps) => {
    return (
        <section id={id} className={clsx("py-20 md:py-32 relative", className)}>
            {children}
        </section>
    );
};

export default Section;
