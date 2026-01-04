export interface Experience {
    company: string;
    role: string;
    duration: string;
    location: string;
    description?: string;
}

export interface Project {
    title: string;
    tech: string[];
    description: string;
    link?: string;
}

export const resumeData = {
    personal: {
        name: "Piyush Mishra",
        title: "Data Scientist | Generative AI & NLP Engineer",
        subtitle: "Python, LLMs, Machine Learning, MLOps | AWS & Scalable APIs",
        location: "Lucknow, Uttar Pradesh, India",
        email: "piyushmishra.professional@gmail.com",
        social: {
            linkedin: "https://www.linkedin.com/in/piyush-mishra-00",
            github: "https://github.com/PIYUSH-MISHRA-00",
            portfolio: "https://piyush-mishra-00.github.io/Portfolio/",
            twitter: "https://twitter.com/its_Mishra_00",
            instagram: "https://www.instagram.com/ni_sh_a.char/",
            youtube: "https://www.youtube.com/@ni-sh-a-char/featured",
            docker: "https://hub.docker.com/u/piyushmishradocker",
            orcid: "https://orcid.org/0000-0001-9775-1596",
            galiyaara: "https://galiyaara-36629.web.app/",
        },
        resumeLink: "https://drive.google.com/file/d/1GteUPxHZo2mcqTwas0TGjn4-mPZBc2xq/view?usp=sharing",
        summary: "I am a good learner and make the best use of my skills when the situation demands it. Just learning and executing the code and trying to become better at it."
    },
    experience: [
        {
            company: "Orgenik",
            role: "Software Developer - AI",
            duration: "November 2023 - Present",
            location: "Ahmedabad, Gujarat, India",
            description: "Spearheading the development of AI-driven solutions, focusing on scalable model deployment and optimizing NLP pipelines. Leveraging Python and cloud infrastructure to build robust generative AI applications."
        },
        {
            company: "ni_sh_a.char",
            role: "Founder",
            duration: "June 2021 - Present",
            location: "",
            description: "Written and deployed code majorly consisting of Java, Python, BASH, C for the organization. Maintained the code by keeping up with the resources necessary to keep the systems up and running as its owner. Worked on the organization's products and reached other organizations to collaborate upon the products. Created projects like 'Bio.Informatica' and 'Assist'."
        },
        {
            company: "Aasakya Digitals",
            role: "Application Developer",
            duration: "May 2023 - November 2023",
            location: "Noida, Uttar Pradesh, India",
            description: "Developed and maintained full-stack web applications, ensuring high performance and responsiveness. Collaborated with cross-functional teams to define, design, and ship new features."
        },
        {
            company: "Perennation Computer Solutions",
            role: "Trainee Data Analyst",
            duration: "April 2023 - June 2023",
            location: "Kolkata, West Bengal, India",
            description: "Analyzed complex datasets to identify trends and patterns, generating actionable insights for business optimization. Utilized Python and SQL for data cleaning, transformation, and visualization."
        },
        {
            company: "MEDACLES",
            role: "Full Stack Developer",
            duration: "December 2024 - March 2025",
            location: "Greater London, England, United Kingdom",
            description: "Built and optimized user-centric web platforms using modern frameworks. Focused on creating seamless user experiences and implementing secure backend APIs."
        },
        {
            company: "CodSoft",
            role: "Web Development Intern",
            duration: "October 2023 - November 2023",
            location: "Kolkata, West Bengal, India",
            description: "Worked on a content management tool - blogs and a video conferencing web app"
        },
        {
            company: "Bharat Intern",
            role: "Full Stack Developer Intern",
            duration: "October 2023 - November 2023",
            location: "Bhopal, Madhya Pradesh, India",
            description: "Worked on a portfolio, a landing page and a calculator web app"
        },
        {
            company: "CodeClause",
            role: "Data Science Intern",
            duration: "September 2023 - October 2023",
            location: "Pune, Maharashtra, India",
            description: "Worked on various tasks to make ML models including Stock Price Prediction and Medicine Recommendation"
        },
        {
            company: "Oasis Infobyte",
            role: "Android Developer",
            duration: "September 2023 - October 2023",
            location: "New Delhi, Delhi, India",
            description: "Worked on various tasks to make Android apps including Stop Watch and To-Do list apps"
        },
        {
            company: "The Linux Foundation",
            role: "Linux Kernel Mentee",
            duration: "September 2022 - November 2022",
            location: "San Francisco, California, United States",
            description: "Worked with checkpatch.pl script, generated and sent patches, worked with git send mail, worked on collecting resources in order to complete the menteeship task and became a speaker at mentorship showcase 2023"
        },
        {
            company: "Bundelkhand University",
            role: "Android Resource Person",
            duration: "June 2022 - July 2022",
            location: "Jhansi, Uttar Pradesh, India",
            description: "Worked on collecting and integrating various Android layouts and activities for the completion of an Android application"
        },
        {
            company: "Code with Coffee",
            role: "Android Developer",
            duration: "February 2022 - April 2022",
            location: "Kolkata, West Bengal, India",
            description: "Worked on correcting the code of the job search application for the company with other developers"
        },
        {
            company: "The Entrepreneurship Network",
            role: "Android Development-Associate",
            duration: "January 2022 - March 2022",
            location: "Delhi, India",
            description: "Task-based internship for the submission of Android apps. Developed apps with Kotlin and Java, worked with frontend layouts, and integrated several activities."
        },
        {
            company: "Internship Studio",
            role: "Web Development Intern",
            duration: "June 2021 - July 2021",
            location: "Pune, Maharashtra, India",
            description: "Got trained for web development with hands-on experience developing an E-Commerce website with the help of HTML, CSS, and JavaScript"
        },
        {
            company: "Hariyali",
            role: "Content Writer",
            duration: "March 2021 - April 2021",
            location: "Freelance",
            description: "Created engaging and SEO-optimized content for digital platforms, focusing on clarity and audience retention."
        },
        {
            company: "Java Tutor",
            role: "Tutor",
            duration: "December 2020 - April 2021",
            location: "Lucknow, Uttar Pradesh, India",
            description: "Mentored students in Java programming concepts, from object-oriented programming fundamentals to data structures."
        }
    ],
    skills: {
        languages: ["Python", "Java", "C", "Bash", "German (Elementary)", "Hindi", "English"],
        cloud: ["AWS", "MLOps", "Docker", "Kubernetes"],
        frameworks: ["React", "Next.js", "Streamlit", "FastAPI", "Flask"],
        ai: ["Generative AI", "NLP", "LLMs", "Machine Learning", "Neural Networks", "TensorFlow", "PyTorch"],
        tools: ["Git", "Linux", "Android Studio", "Jira"]
    },
    projects: [
        {
            title: "NATRAJ - Encrypted AI Server",
            tech: ["Python", "Neural Networks", "Encryption"],
            description: "A localized End to End encrypted server with Neural Networks to act as a packet filtering firewall and accessing the internet using proxy for actual device ID masking."
        },
        {
            title: "Kaalka Encryption Algorithm",
            tech: ["Python", "Cryptography", "NTP"],
            description: "Encryption Algorithm and its uses with Network Time Protocol (NTP) for time-variant security.",
            link: "https://github.com/PIYUSH-MISHRA-00/Kaalka-API"
        },
        {
            title: "Dockeroid",
            tech: ["Docker", "Emulation"],
            description: "Containerized Emulator for Application Testing and Debugging."
        },
        {
            title: "AI-Based Proposal Evaluation",
            tech: ["Python", "Streamlit", "Gemini API"],
            description: "Streamlit app that parses and scores proposal PDFs using Google Gemini.",
            link: "https://github.com/PIYUSH-MISHRA-00/AI-Based-Proposal-Evaluation-Assistant"
        },
        {
            title: "Assist - AI Desktop Overlay",
            tech: ["Python", "Google Gemini"],
            description: "Real-time assistant that captures audio/text and queries Google Gemini to generate answers.",
            link: "https://github.com/PIYUSH-MISHRA-00/Assist"
        },
        {
            title: "Airline Market Demand Web App",
            tech: ["Flask", "OpenSky API", "LLMs"],
            description: "Flask app that fetches live flight data, analyzes demand, and generates LLM-powered insights.",
            link: "https://github.com/PIYUSH-MISHRA-00/Airline-Market-Demand-Web-App"
        },
        {
            title: "Recommendation & Alerts",
            tech: ["Python", "Streamlit"],
            description: "Multi-project repo for financial advice, health alerts, and learning recommendations.",
            link: "https://github.com/PIYUSH-MISHRA-00/Multi-Project-Repository-Financial-Advice-Health-Alerts-and-Learning-Advice"
        },
        {
            title: "Git-Automation-Script",
            tech: ["Bash", "Git"],
            description: "Automated workflow scripts to streamline version control operations and enhance developer productivity."
        },
        {
            title: "Bio.Informatica",
            tech: ["Python", "Docker"],
            description: "Dockerized bioinformatics toolkit for DNA sequence analysis.",
            link: "https://github.com/PIYUSH-MISHRA-00/ni-sh-a-char/tree/main/Bio.Informatica"
        },
        {
            title: "Bookish",
            tech: ["Python", "ML", "Recommender"],
            description: "Book recommendation system using collaborative and content-based filtering.",
            link: "https://github.com/PIYUSH-MISHRA-00/Bookish"
        },
        {
            title: "Meta-Model Architecture",
            tech: ["AI", "Architecture"],
            description: "Architectural patterns for scalable meta-learning systems and model interoperability."
        }
    ] as Project[],
    education: [
        {
            school: "Bundelkhand University",
            degree: "Bachelor of Technology - Computer Science and Engineering",
            year: "2019 - 2023",
            grade: "CGPA: 7.59"
        },
        {
            school: "New Public College, Lucknow",
            degree: "Senior Secondary (Physics, Chemistry, Maths, CS)",
            year: "2018",
            grade: "76.4%"
        },
        {
            school: "New Public College, Lucknow",
            degree: "Higher Secondary",
            year: "2016",
            grade: "74.6%"
        }
    ],
    certifications: [
        "Java",
        "Data Visualization in Python",
        "Certificate of Participation in Data Challenge II",
        "Electronic Arts - Software Engineering Job Simulation",
        "Learning Java"
    ],
    awards: [
        "2nd position in STEM Electronics/Robotics design and prototype thinkering HACKATHON",
        "SANSKRITI: The Indian Culture Photography Competition",
        "2nd position in State level Science and Innovation Competition",
        "1st position in ISRO Quiz Competition",
        "2nd Position in Ideathon Smart City Project, organized by Jhansi Municipal Corporation"
    ]
};
