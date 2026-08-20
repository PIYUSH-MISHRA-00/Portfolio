/**
 * Facts that do not live in GitHub metadata. Everything project-shaped comes from
 * data/portfolio.json instead — edit that by running `npm run sync`, not by hand.
 */

export const identity = {
  name: "Piyush Mishra",
  handle: "PIYUSH-MISHRA-00",
  location: "Lucknow, Uttar Pradesh, India",
  email: "piyushmishra.professional@gmail.com",
  // Kept from the previous portfolio — do not change without a new upload.
  resume: "https://drive.google.com/file/d/1GteUPxHZo2mcqTwas0TGjn4-mPZBc2xq/view?usp=sharing",
  summary:
    "I build systems end to end — original encryption algorithms, applied language models, data pipelines and the containers they ship in. Most of what follows is public code you can read, not a list of claims.",
};

export const links = [
  { label: "GitHub", href: "https://github.com/PIYUSH-MISHRA-00", handle: "PIYUSH-MISHRA-00" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/piyush-mishra-00", handle: "piyush-mishra-00" },
  { label: "Email", href: "mailto:piyushmishra.professional@gmail.com", handle: "piyushmishra.professional@gmail.com" },
  { label: "ORCID", href: "https://orcid.org/0000-0001-9775-1596", handle: "0000-0001-9775-1596" },
  { label: "Docker Hub", href: "https://hub.docker.com/u/piyushmishradocker", handle: "piyushmishradocker" },
  { label: "RapidAPI", href: "https://rapidapi.com/PIYUSHMISHRA00", handle: "Kaalka API" },
  { label: "X", href: "https://twitter.com/its_Mishra_00", handle: "@its_Mishra_00" },
  { label: "YouTube", href: "https://www.youtube.com/@ni-sh-a-char/featured", handle: "@ni-sh-a-char" },
  { label: "Instagram", href: "https://www.instagram.com/ni_sh_a.char/", handle: "@ni_sh_a.char" },
  { label: "Galiyaara", href: "https://ni-sh-a-char.github.io/Galiyaara/", handle: "ni-sh-a-char.github.io/Galiyaara" },
] as const;

export type Role = {
  company: string;
  role: string;
  duration: string;
  location: string;
  description: string;
};

export const experience: Role[] = [
  {
    company: "Orgenik",
    role: "Software Developer — AI",
    duration: "Nov 2023 — Present",
    location: "Ahmedabad, Gujarat, India",
    description:
      "Building AI-driven product features: model deployment, NLP pipeline optimisation and generative AI services on Python and cloud infrastructure.",
  },
  {
    company: "ni_sh_a.char",
    role: "Founder",
    duration: "Jun 2021 — Present",
    location: "Remote",
    description:
      "Run the organisation behind NATRAJ, Bio.Informatica, Dockeroid, SHE and ETERNITY. Wrote and maintain the Java, Python, Bash and C codebases, and handle collaboration with outside organisations.",
  },
  {
    company: "MEDACLES",
    role: "Full Stack Developer",
    duration: "Dec 2024 — Mar 2025",
    location: "Greater London, United Kingdom",
    description: "Built user-facing web platforms and the secure backend APIs behind them.",
  },
  {
    company: "Aasakya Digitals",
    role: "Application Developer",
    duration: "May 2023 — Nov 2023",
    location: "Noida, Uttar Pradesh, India",
    description: "Developed and maintained full-stack web applications with cross-functional feature teams.",
  },
  {
    company: "Perennation Computer Solutions",
    role: "Trainee Data Analyst",
    duration: "Apr 2023 — Jun 2023",
    location: "Kolkata, West Bengal, India",
    description: "Cleaned, transformed and visualised datasets in Python and SQL to surface business trends.",
  },
  {
    company: "CodSoft",
    role: "Web Development Intern",
    duration: "Oct 2023 — Nov 2023",
    location: "Kolkata, West Bengal, India",
    description: "Built a blog content management tool and a video conferencing web app.",
  },
  {
    company: "Bharat Intern",
    role: "Full Stack Developer Intern",
    duration: "Oct 2023 — Nov 2023",
    location: "Bhopal, Madhya Pradesh, India",
    description: "Shipped a portfolio site, a landing page and a calculator web app.",
  },
  {
    company: "CodeClause",
    role: "Data Science Intern",
    duration: "Sep 2023 — Oct 2023",
    location: "Pune, Maharashtra, India",
    description: "Built ML models for stock price prediction and medicine recommendation.",
  },
  {
    company: "Oasis Infobyte",
    role: "Android Developer",
    duration: "Sep 2023 — Oct 2023",
    location: "New Delhi, India",
    description: "Built Android apps including a stopwatch and a to-do list.",
  },
  {
    company: "The Linux Foundation",
    role: "Linux Kernel Mentee",
    duration: "Sep 2022 — Nov 2022",
    location: "San Francisco, California, United States",
    description:
      "Worked with checkpatch.pl, generated and submitted kernel patches over git send-email, and spoke at the Mentorship Showcase 2023.",
  },
  {
    company: "Bundelkhand University",
    role: "Android Resource Person",
    duration: "Jun 2022 — Jul 2022",
    location: "Jhansi, Uttar Pradesh, India",
    description: "Integrated Android layouts and activities to complete a university application.",
  },
  {
    company: "Code with Coffee",
    role: "Android Developer",
    duration: "Feb 2022 — Apr 2022",
    location: "Kolkata, West Bengal, India",
    description: "Debugged and corrected the company's job-search application alongside other developers.",
  },
  {
    company: "The Entrepreneurship Network",
    role: "Android Development Associate",
    duration: "Jan 2022 — Mar 2022",
    location: "Delhi, India",
    description: "Task-based Android delivery in Kotlin and Java, covering layouts and multi-activity flows.",
  },
  {
    company: "Internship Studio",
    role: "Web Development Intern",
    duration: "Jun 2021 — Jul 2021",
    location: "Pune, Maharashtra, India",
    description: "Built an e-commerce site with HTML, CSS and JavaScript.",
  },
  {
    company: "Java Tutor",
    role: "Tutor",
    duration: "Dec 2020 — Apr 2021",
    location: "Lucknow, Uttar Pradesh, India",
    description: "Taught Java from OOP fundamentals through data structures.",
  },
];

export const education = [
  {
    school: "Bundelkhand University",
    degree: "B.Tech, Computer Science and Engineering",
    year: "2019 — 2023",
    grade: "CGPA 7.59",
  },
  {
    school: "New Public College, Lucknow",
    degree: "Senior Secondary — Physics, Chemistry, Maths, CS",
    year: "2018",
    grade: "76.4%",
  },
  { school: "New Public College, Lucknow", degree: "Higher Secondary", year: "2016", grade: "74.6%" },
];

export const certifications = [
  "Java",
  "Learning Java",
  "Data Visualization in Python",
  "Electronic Arts — Software Engineering Job Simulation",
  "Certificate of Participation, Data Challenge II",
];

export const awards = [
  "Speaker, Linux Foundation Mentorship Showcase 2023",
  "2nd place — STEM Electronics/Robotics design and prototype hackathon",
  "2nd place — State-level Science and Innovation Competition",
  "1st place — ISRO Quiz Competition",
  "2nd place — Ideathon Smart City Project, Jhansi Municipal Corporation",
  "SANSKRITI — The Indian Culture Photography Competition",
];

export const spokenLanguages = ["English", "Hindi", "German (elementary)"];
