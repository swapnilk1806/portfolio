import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

// ─── Global Styles (injected once) – exactly as before ────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080c12;
    --bg2:       #0d1117;
    --surface:   rgba(255,255,255,0.04);
    --border:    rgba(255,255,255,0.08);
    --accent:    #00d4ff;
    --accent2:   #7c3aed;
    --accent3:   #f59e0b;
    --text:      #e8eaf0;
    --muted:     #6b7280;
    --font-head: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --font-serif:'Instrument Serif', serif;
    --radius:    14px;
    --glow:      0 0 40px rgba(0,212,255,0.15);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-head);
    overflow-x: hidden;
    line-height: 1.6;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 2px; }

  ::selection { background: rgba(0,212,255,0.25); }

  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(0,212,255,0.3); }
    50%      { box-shadow: 0 0 60px rgba(0,212,255,0.6); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes blink {
    0%,100% { opacity:1; }
    50%     { opacity:0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes counter {
    from { transform: translateY(8px); opacity:0; }
    to   { transform: translateY(0);   opacity:1; }
  }

  .reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    text-decoration: none;
  }
  .btn-primary {
    background: var(--accent);
    color: #000;
  }
  .btn-primary:hover {
    background: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,212,255,0.3);
  }
  .btn-ghost {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.08);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-2px);
  }
  .btn-purple {
    background: var(--accent2);
    color: #fff;
  }
  .btn-purple:hover {
    filter: brightness(1.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(124,58,237,0.4);
  }

  .glass {
    background: var(--surface);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 11px;
    background: rgba(0,212,255,0.1);
    color: var(--accent);
    border: 1px solid rgba(0,212,255,0.2);
  }
  .tag-purple {
    background: rgba(124,58,237,0.15);
    color: #a78bfa;
    border-color: rgba(124,58,237,0.25);
  }
  .tag-amber {
    background: rgba(245,158,11,0.12);
    color: var(--accent3);
    border-color: rgba(245,158,11,0.2);
  }

  /* Nav */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(8,12,18,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s;
  }
  .nav-logo {
    font-size: 20px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
  .nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    font-family: var(--font-mono);
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--accent); }

  /* Hero */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px 40px 80px;
    position: relative;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,212,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(124,58,237,0.1) 0%, transparent 50%);
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%);
  }
  .hero-content {
    max-width: 900px;
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 1;
    animation: fade-up 1s ease both;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 999px;
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.2);
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--accent);
    margin-bottom: 32px;
  }
  .hero-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse-glow 2s ease infinite;
  }
  .hero-name {
    font-size: clamp(52px, 8vw, 100px);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -3px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-role {
    font-size: clamp(14px, 2vw, 18px);
    color: var(--muted);
    font-family: var(--font-mono);
    margin-bottom: 28px;
    letter-spacing: 1px;
  }
  .hero-typing {
    font-size: clamp(22px, 3.5vw, 38px);
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--accent);
    min-height: 48px;
    margin-bottom: 40px;
  }
  .cursor {
    display: inline-block;
    width: 3px;
    height: 1em;
    background: var(--accent);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
  }
  .hero-desc {
    max-width: 600px;
    margin: 0 auto 48px;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.8;
  }
  .hero-ctas {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Stats */
  .stats {
    display: flex;
    justify-content: center;
    gap: 0;
    margin: 80px 40px 0;
    flex-wrap: wrap;
  }
  .stat-item {
    flex: 1;
    min-width: 150px;
    max-width: 220px;
    text-align: center;
    padding: 40px 24px;
    border-right: 1px solid var(--border);
    position: relative;
    transition: background 0.3s;
  }
  .stat-item:last-child { border-right: none; }
  .stat-item:hover { background: var(--surface); }
  .stat-num {
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
    margin-bottom: 8px;
  }
  .stat-label {
    font-size: 12px;
    color: var(--muted);
    font-family: var(--font-mono);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Section */
  section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 100px 40px;
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .section-title {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    letter-spacing: -2px;
    margin-bottom: 16px;
    line-height: 1.1;
  }
  .section-subtitle {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 14px;
    margin-bottom: 64px;
  }

  /* Skills */
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  .skill-card {
    padding: 28px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
    transition: all 0.3s;
  }
  .skill-card:hover {
    border-color: rgba(0,212,255,0.3);
    transform: translateY(-4px);
    box-shadow: var(--glow);
  }
  .skill-card-title {
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--accent);
    margin-bottom: 20px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .skill-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .skill-name {
    font-size: 14px;
    font-weight: 500;
    flex: 1;
  }
  .skill-bar-bg {
    width: 140px;
    height: 4px;
    background: rgba(255,255,255,0.07);
    border-radius: 4px;
    overflow: hidden;
  }
  .skill-bar-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transform-origin: left;
    transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
  }

  /* Projects */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }
  .project-card {
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .project-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .project-card:hover {
    border-color: rgba(0,212,255,0.25);
    transform: translateY(-8px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.4), var(--glow);
  }
  .project-card:hover::before { opacity: 1; }
  .project-banner {
    height: 5px;
    background: linear-gradient(90deg, var(--accent), var(--accent2), #f59e0b);
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
  .project-body { padding: 28px; }
  .project-num {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--muted);
    margin-bottom: 10px;
    letter-spacing: 2px;
  }
  .project-name {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
  }
  .project-desc {
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.75;
    margin-bottom: 20px;
    font-family: var(--font-mono);
  }
  .project-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 24px;
  }
  .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .project-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Education */
  .edu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  .edu-card {
    padding: 32px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
  }
  .edu-card:hover {
    border-color: rgba(124,58,237,0.3);
    transform: translateY(-4px);
  }
  .edu-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(124,58,237,0.05), transparent);
  }
  .edu-degree {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .edu-school {
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--accent);
    margin-bottom: 16px;
  }
  .edu-cgpa {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--accent3);
  }

  /* Certifications */
  .cert-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  .cert-card {
    padding: 24px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s;
  }
  .cert-card:hover {
    border-color: rgba(0,212,255,0.3);
    transform: translateX(4px);
  }
  .cert-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: rgba(0,212,255,0.1);
    flex-shrink: 0;
  }
  .cert-name {
    font-size: 14px;
    font-weight: 600;
  }

  /* Contact */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .contact-links { display: flex; flex-direction: column; gap: 12px; }
  .contact-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
    text-decoration: none;
    color: var(--text);
    transition: all 0.3s;
  }
  .contact-link:hover {
    border-color: var(--accent);
    transform: translateX(4px);
    color: var(--accent);
  }
  .contact-link-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    background: rgba(0,212,255,0.1);
    flex-shrink: 0;
  }
  .contact-link-label {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .contact-link-value { font-size: 14px; font-weight: 600; }
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label {
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .form-input, .form-textarea {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--accent);
  }
  .form-textarea { min-height: 120px; }

  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 48px 40px;
    text-align: center;
  }
  .footer-text {
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--muted);
  }

  /* Particles canvas */
  canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* Mobile */
  @media (max-width: 768px) {
    nav { padding: 14px 20px; }
    .nav-links { display: none; }
    .hero { padding: 100px 20px 60px; }
    section { padding: 70px 20px; }
    .stats { margin: 40px 20px 0; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
    .stat-item:last-child { border-bottom: none; }
    .contact-grid { grid-template-columns: 1fr; }
    footer { padding: 32px 20px; }
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  "Java Developer",
  "Spring Boot Engineer",
  "MERN Stack Developer",
  "Microservices Architect",
  "Cloud Native Builder",
];

const SKILLS_DATA = [
  {
    title: "Languages",
    items: [
      { name: "Java", level: 92 },
      { name: "JavaScript/TS", level: 88 },
      { name: "Python", level: 72 },
      { name: "SQL", level: 85 },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Spring Boot", level: 90 },
      { name: "Node.js / Express", level: 84 },
      { name: "Apache Kafka", level: 80 },
      { name: "REST APIs", level: 92 },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React.js", level: 86 },
      { name: "HTML5 / CSS3", level: 90 },
      { name: "TypeScript", level: 82 },
      { name: "Responsive Design", level: 88 },
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      { name: "AWS", level: 78 },
      { name: "Docker", level: 84 },
      { name: "Kubernetes", level: 76 },
      { name: "CI/CD", level: 80 },
    ],
  },
  {
    title: "Databases",
    items: [
      { name: "PostgreSQL", level: 86 },
      { name: "MongoDB", level: 82 },
      { name: "Redis", level: 80 },
      { name: "MySQL", level: 85 },
    ],
  },
  {
    title: "Architecture",
    items: [
      { name: "Microservices", level: 85 },
      { name: "System Design", level: 82 },
      { name: "Event-Driven Arch", level: 80 },
      { name: "DSA", level: 88 },
    ],
  },
];

// ─── 3 MAJOR PROJECTS (with GitHub links updated) ────────────────────────────
const MAJOR_PROJECTS = [
  {
    num: "01",
    name: "Code Share Platform",
    desc: "Real-time collaborative code-sharing platform enabling multiple developers to write and edit code simultaneously. Built with event-driven architecture for sub-millisecond synchronization.",
    tech: ["MERN Stack", "Apache Kafka", "Redis", "Docker", "WebSockets"],
    features: ["Real-time Collaboration", "Live Editing", "Kafka Streaming", "Redis Caching", "RBAC Auth", "Docker Deploy"],
    github: "https://github.com/swapnilk1806/Code-sharing-platform", // (Not provided in list, keeping as is)
  },
  {
    num: "02",
    name: "Distributed ERP System",
    desc: "Enterprise-scale distributed ERP platform managing HR, Finance, Inventory, Procurement, and Operations modules with fault isolation and centralized API Gateway.",
    tech: ["Java", "Spring Boot", "Spring Cloud", "Kafka", "Redis", "PostgreSQL", "AWS"],
    features: ["Microservices", "JWT Security", "API Gateway", "Service Discovery", "Redis Caching", "AWS Deploy"],
    github: "https://github.com/swapnilk1806/Distributed-Enterprise-Resource-Planning", // (Not provided, keeping)
  },
  {
    num: "03",
    name: "Cloud-Native File Storage",
    desc: "Cloud-native large file storage platform with chunk-based upload architecture. Optimized PostgreSQL indexing and async processing for high throughput with Kubernetes auto-scaling.",
    tech: ["Spring Boot", "Kafka", "Redis", "PostgreSQL", "Docker", "Kubernetes"],
    features: ["Chunk Processing", "K8s Auto-Scaling", "Kafka Processing", "Redis Caching", "High Availability", "Monitoring"],
    github: "https://github.com/swapnilk1806/Cloud-Native-Large-File-Storage",
  },
];

// ─── 12 ACADEMIC PROJECTS (with GitHub links updated) ───────────────────────
const ACADEMIC_PROJECTS = [
  {
    num: "01",
    name: "Bus Charging Scheduler",
    desc: "Python + Streamlit application that schedules charging operations for electric buses traveling between Bengaluru and Kochi.",
    tech: ["Python", "Streamlit", "Pandas", "Optimization"],
    features: ["Route-based charging schedules", "Real-time bus tracking", "Energy consumption prediction", "Interactive dashboard", "CSV export"],
    github: "https://github.com/swapnilk1806/Bus-Charging-Scheduler",
  },
  {
    num: "02",
    name: "HEALOSBENCH – Medical LLM Evaluation Harness",
    desc: "Production-ready evaluation system to rigorously assess LLM performance on structured clinical data extraction. Converts doctor-patient transcripts into standardized JSON with per‑field metrics.",
    tech: ["TypeScript", "Next.js", "Hono", "PostgreSQL", "Anthropic SDK"],
    features: ["Per‑field F1, precision, recall", "Zero-shot / few-shot / CoT", "Real‑time dashboard", "Hallucination detection", "Resumable runs & caching", "< $1 per evaluation"],
    github: "https://github.com/swapnilk1806/Medical-llm-eval-harness",
  },
  {
    num: "03",
    name: "Laptop Price Predictor",
    desc: "Machine learning model that predicts laptop prices based on specifications like RAM, storage, processor, brand, and display.",
    tech: ["Python", "Scikit-learn", "Pandas", "Flask", "Regression"],
    features: ["Feature engineering", "Multiple ML models", "Price range classification", "Interactive web interface", "Model comparison"],
    github: "https://github.com/swapnilk1806/laptop-price-prediction-with-AI",
  },
  {
    num: "04",
    name: "Loan Prediction System",
    desc: "End‑to‑end system that predicts loan approval probability using applicant data (income, credit history, loan amount, etc.).",
    tech: ["Python", "Scikit-learn", "XGBoost", "Flask", "Pandas"],
    features: ["Data preprocessing", "SMOTE for imbalance", "Hyperparameter tuning", "REST API", "Dashboard with insights"],
    github: "https://github.com/swapnilk1806/loan-prediction-system",
  },
  {
    num: "05",
    name: "Exam Paper Checker",
    desc: "AI‑powered tool that automatically grades answer sheets using natural language processing. Supports both descriptive and objective questions.",
    tech: ["Python", "NLP", "Transformers", "Flask", "PDF parsing"],
    features: ["Keyword & semantic matching", "Automated score calculation", "Feedback generation", "Bulk processing", "Export results to CSV"],
    github: "https://github.com/swapnilk1806/Exam-paper-checker",
  },
  {
    num: "06",
    name: "AI Email Classification System",
    desc: "Flask + Gmail API + Google Gemini AI system that automatically fetches, categorizes, and processes support emails, reducing manual triage effort.",
    tech: ["Python", "Flask", "Google Gemini AI", "Gmail API", "OAuth"],
    features: ["Auto‑fetch unread emails", "Multi‑label classification", "CSV export", "Real‑time dashboard", "Low token cost"],
    github: "https://github.com/swapnilk1806/Al-Email",
  },
  {
    num: "07",
    name: "Online Library System",
    desc: "Full‑stack library management system with role‑based access for students and admins. Browse, borrow, and return books online.",
    tech: ["Node.js", "Express.js", "Handlebars (HBS)", "MongoDB", "JWT"],
    features: ["User authentication", "Book search & filters", "Borrow/return tracking", "Admin book management", "Due date reminders"],
    github: "https://github.com/swapnilk1806/Online-Library-System",
  },
  {
    num: "08",
    name: "Health Portal",
    desc: "Healthcare web portal for managing doctor appointments, patient sessions, and medical records.",
    tech: ["Node.js", "Express", "Handlebars", "PostgreSQL", "Bootstrap"],
    features: ["Doctor/patient dashboards", "Appointment scheduling", "Medical history storage", "Prescription management", "Responsive design"],
    github: "#", // URL not provided for Health Portal
  },
  {
    num: "09",
    name: "Medical Chatbot",
    desc: "AI‑powered chatbot that provides accurate, informative responses to medical queries using natural language understanding and clinical knowledge bases.",
    tech: ["Python", "LangChain", "Flask", "LLaMA2", "Pinecone"],
    features: ["Symptom checker", "Medicine information", "Health tips", "Conversation memory", "Trustworthy sources"],
    github: "https://github.com/swapnilk1806/Medical_ChatBot",
  },
  {
    num: "10",
    name: "MCQ Generator",
    desc: "Dynamic web app using OpenAI LLM and Streamlit to automatically generate high‑quality multiple‑choice questions from any text or topic. Hosted on AWS EC2.",
    tech: ["Python", "Streamlit", "OpenAI API", "AWS EC2", "Prompt Engineering"],
    features: ["Context‑aware MCQs", "Difficulty control", "Export to PDF/CSV", "Batch generation", "Ubuntu server deployment"],
    github: "#", // URL not provided for MCQ Generator
  },
  {
    num: "11",
    name: "Travel Management System",
    desc: "User‑friendly web application to plan and organize travel itineraries – create trip plans, manage daily schedules, explore destinations.",
    tech: ["HTML5", "CSS3", "JavaScript", "LocalStorage", "Responsive UI"],
    features: ["Itinerary builder", "Destination explorer", "Budget calculator", "Packing checklist", "Mobile‑friendly"],
    github: "#", // URL not provided for Travel Management System
  },
  {
    num: "12",
    name: "Spotify Clone Frontend",
    desc: "Immersive music streaming UI that mimics Spotify's look and feel – browse, search, and play music via integration with Spotify's Web API.",
    tech: ["HTML5", "CSS3", "JavaScript", "Spotify Web API", "Responsive UI"],
    features: ["User login via Spotify", "Playlist browsing", "Track search & player", "Responsive layout", "Now playing bar"],
    github: "https://github.com/swapnilk1806/spotify-clone",
  },
];

const CERTS = [
  { icon: "☁️", name: "AWS Certification" },
  { icon: "🤖", name: "Generative AI Certification" },
  { icon: "🌱", name: "Spring Boot Certification" },
  { icon: "🧩", name: "DSA & Java Certification" },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useTypingAnimation(texts: string[], speed = 70, pause = 1800) {
  const [displayText, setDisplayText] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplayText(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause);
          } else {
            setCharIdx((c) => c + 1);
          }
        } else {
          setDisplayText(current.slice(0, charIdx - 1));
          if (charIdx - 1 === 0) {
            setDeleting(false);
            setTextIdx((i) => (i + 1) % texts.length);
            setCharIdx(0);
          } else {
            setCharIdx((c) => c - 1);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return displayText;
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

// ─── Particles ────────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const NUM = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < NUM; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} />;
}

// ─── Skill Bar ────────────────────────────────────────────────────────────────
function SkillBar({ name, level, visible }: { name: string; level: number; visible: boolean }) {
  return (
    <div className="skill-row">
      <span className="skill-name">{name}</span>
      <div className="skill-bar-bg">
        <div className="skill-bar-fill" style={{ width: visible ? `${level}%` : "0%" }} />
      </div>
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatItem({ num, label, suffix = "" }: { num: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(num, 2000, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-num">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────
function SkillCard({ title, items }: { title: string; items: { name: string; level: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="skill-card reveal" ref={ref}>
      <div className="skill-card-title">{title}</div>
      {items.map((s) => (<SkillBar key={s.name} name={s.name} level={s.level} visible={visible} />))}
    </div>
  );
}

// ─── Project Card (reusable for both major and academic) ──────────────────────
function ProjectCard({ project, type = "major" }: { project: any; type?: "major" | "academic" }) {
  // Type can be used for styling differences, but we'll keep same look
  return (
    <div className="project-card reveal">
      <div className="project-banner" />
      <div className="project-body">
        <div className="project-num">{type === "major" ? "MAJOR" : "ACADEMIC"} {project.num}</div>
        <div className="project-name">{project.name}</div>
        <p className="project-desc">{project.desc}</p>
        <div className="project-tech">
          {project.tech.map((t: string) => (<span className="tag" key={t}>{t}</span>))}
        </div>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Key Features</div>
        <div className="project-features" style={{ marginBottom: 24 }}>
          {project.features.map((f: string) => (<span className="tag tag-purple" key={f}>{f}</span>))}
        </div>
        <div className="project-actions">
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            View Code
          </a>
          <a href="#" className="btn btn-ghost" onClick={(e) => e.preventDefault()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
            Live Demo
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_STYLES;
    document.head.appendChild(style);
    document.title = "Swapnil Kadam – Software Engineer";
    return () => { document.head.removeChild(style); };
  }, []);

  const typing = useTypingAnimation(TYPING_TEXTS);
  useScrollReveal();

  const navLinks = ["About", "Skills", "Projects", "Academic", "Education", "Contact"];

  return (
    <>
      <ParticleCanvas />

      {/* Navigation */}
      <nav>
        <div className="nav-logo">SK</div>
        <ul className="nav-links">
          {navLinks.map((l) => (<li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>))}
        </ul>
        <a href="mailto:swapnilk.kadam01@gmail.com" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 18px" }}>Hire Me</a>
      </nav>

      {/* Hero */}
      <div className="hero" id="about">
        <div className="hero-bg" /><div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">Available for opportunities</div>
          <h1 className="hero-name">Swapnil<br />Kadam</h1>
          <div className="hero-role">SOFTWARE ENGINEER &nbsp;/&nbsp; MCA STUDENT</div>
          <div className="hero-typing">{typing}<span className="cursor" /></div>
          <p className="hero-desc">Building enterprise-scale distributed systems and cloud-native applications. Skilled in Java, Spring Boot, MERN Stack, AWS, Docker, Kubernetes, and Apache Kafka. Solved 650+ coding problems on LeetCode.</p>
          <div className="hero-ctas">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="https://github.com/swapnilk1806/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>GitHub</a>
            <a href="https://www.linkedin.com/in/swapnil-kadam/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>LinkedIn</a>
            <a href="https://leetcode.com/u/swapnilk1806/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" /></svg>LeetCode</a>
            <a href="https://drive.google.com/file/d/1pNkv9CWd3bZAOMT_DfDHzbjluHLoJn8j/view" target="_blank" rel="noopener noreferrer" className="btn btn-purple"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Resume</a>
          </div>
        </div>
      </div>

      {/* Stats – updated to 15+ Projects */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          <StatItem num={650} suffix="+" label="Problems Solved" />
          <StatItem num={15} suffix="+" label="Projects Built" />
          <StatItem num={20} suffix="+" label="Technologies" />
          <StatItem num={8} suffix=".25" label="MCA CGPA" />
        </div>
      </div>

      {/* Skills section – unchanged */}
      <section id="skills">
        <div className="section-label">Expertise</div>
        <h2 className="section-title">Technical Skills</h2>
        <p className="section-subtitle">Full-stack proficiency across languages, frameworks, cloud platforms, and system design.</p>
        <div className="skills-grid">{SKILLS_DATA.map((cat) => (<SkillCard key={cat.title} title={cat.title} items={cat.items} />))}</div>
        <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {["Java","Spring Boot","React.js","Node.js","TypeScript","Python","Streamlit","LLM","FastAPI","PostgreSQL","MongoDB","AWS","Docker","Kubernetes","Microservices","REST APIs","System Design","CI/CD","Git","WebSockets","JWT","Hibernate","React Native"].map((tech) => (<span key={tech} className="tag tag-amber">{tech}</span>))}
        </div>
      </section>

      {/* Major Projects Section */}
      <section id="projects">
        <div className="section-label">Work</div>
        <h2 className="section-title">Major Projects</h2>
        <p className="section-subtitle">Enterprise-scale distributed systems and cloud-native applications.</p>
        <div className="projects-grid">{MAJOR_PROJECTS.map((p) => (<ProjectCard key={p.num} project={p} type="major" />))}</div>
      </section>

      {/* Highlighted Block – RouteMaster AI (React Native) */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.08), transparent)", pointerEvents: "none" }} />
        <div className="section-label" style={{ justifyContent: "space-between" }}>
          <span>📱 Mobile Innovation</span>
          <span className="tag" style={{ background: "rgba(0,212,255,0.2)" }}>React Native Excellence</span>
        </div>
        <div className="glass" style={{ borderRadius: "24px", border: "1px solid rgba(0,212,255,0.5)", background: "rgba(8,12,18,0.8)", backdropFilter: "blur(24px)", boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.3)", transition: "transform 0.3s ease, box-shadow 0.3s ease", overflow: "hidden" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 30px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.5), 0 0 45px rgba(0,212,255,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.3)"; }}>
          <div style={{ padding: "48px 40px", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
            <div style={{ flex: 2, minWidth: "240px" }}>
              <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "2px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span>✨ HIGHLIGHT PROJECT</span><span className="tag tag-purple">React Native + DSA</span>
              </div>
              <h3 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "20px", background: "linear-gradient(135deg, #fff, var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RouteMaster AI</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: "28px" }}>A cross‑platform mobile app that uses Dijkstra's Algorithm, BFS, and DFS to discover optimal travel routes. Built with React Native & TypeScript, featuring real‑time route optimization, travel cost estimation, DSA visualisation, and a polished dark/light theme UI.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>{["React Native","TypeScript","Dijkstra","BFS/DFS","Min Heap","Animated API"].map((tech) => (<span key={tech} className="tag tag-amber">{tech}</span>))}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
                {["Smart Route Planning","Travel Cost Estimation","Analytics Dashboards","DSA Visualisation Modules","Dark/Light Theme","Animated UI Components","Responsive Mobile Design"].map((feat) => (<div key={feat} style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "var(--accent)" }}>▹</span><span style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>{feat}</span></div>))}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <a href="#" className="btn btn-primary" style={{ background: "var(--accent)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M12 3v18" strokeWidth="2" /></svg>Live Demo (coming soon)</a>
                <a href="https://github.com/swapnilk1806/Route-Master-AI-APP" className="btn btn-ghost" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>GitHub</a>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "180px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: "180px", height: "360px", background: "linear-gradient(145deg, #0a0f16, #05080c)", borderRadius: "32px", border: "1px solid rgba(0,212,255,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,212,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px" }}>
                <div style={{ width: "60px", height: "60px", background: "rgba(0,212,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px" }}>🚀</div>
                <div style={{ width: "100%", height: "6px", background: "rgba(0,212,255,0.2)", borderRadius: "3px", marginBottom: "16px" }} />
                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", marginBottom: "12px" }} />
                <div style={{ width: "80%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", marginBottom: "32px" }} />
                <div style={{ fontSize: "12px", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>RouteMaster AI</div>
                <div style={{ marginTop: "20px", width: "40px", height: "40px", borderRadius: "30px", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>▶</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Projects Section – new */}
      <section id="academic">
        <div className="section-label">Academia</div>
        <h2 className="section-title">Academic & Side Projects</h2>
        <p className="section-subtitle">A diverse collection of AI, full‑stack, and data‑driven applications developed during coursework and self‑learning.</p>
        <div className="projects-grid">{ACADEMIC_PROJECTS.map((p) => (<ProjectCard key={p.num} project={p} type="academic" />))}</div>
      </section>

      {/* Education – unchanged */}
      <section id="education">
        <div className="section-label">Background</div>
        <h2 className="section-title">Education</h2>
        <p className="section-subtitle">Academic foundation in Computer Science and Applications.</p>
        <div className="edu-grid">
          <div className="edu-card reveal"><div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>Currently Pursuing</div><div className="edu-degree">Master of Computer Application</div><div className="edu-school">Pimpri Chinchwad University</div><div className="edu-cgpa"><span>⭐</span> CGPA: 8.25</div></div>
          <div className="edu-card reveal"><div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>Completed</div><div className="edu-degree">Bachelor of Computer Science</div><div className="edu-school">M.S.G College</div><div className="edu-cgpa"><span>⭐</span> CGPA: 8.3</div></div>
        </div>
        <div style={{ marginTop: 64 }}>
          <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--accent)", marginBottom: 24, letterSpacing: 2, textTransform: "uppercase" }}>Certifications</div>
          <div className="cert-grid">{CERTS.map((c) => (<div className="cert-card reveal" key={c.name}><div className="cert-icon">{c.icon}</div><div className="cert-name">{c.name}</div></div>))}</div>
        </div>
      </section>

      {/* Contact – unchanged */}
      <section id="contact">
        <div className="section-label">Get in Touch</div>
        <h2 className="section-title">Let's Connect</h2>
        <p className="section-subtitle">Open to full-time roles, freelance projects, and collaborations.</p>
        <div className="contact-grid">
          <div className="contact-links">
            <a href="mailto:swapnilk.kadam01@gmail.com" className="contact-link"><div className="contact-link-icon">📧</div><div><div className="contact-link-label">Email</div><div className="contact-link-value">swapnilk.kadam01@gmail.com</div></div></a>
            <a href="https://www.linkedin.com/in/swapnil-kadam/" target="_blank" rel="noopener noreferrer" className="contact-link"><div className="contact-link-icon">💼</div><div><div className="contact-link-label">LinkedIn</div><div className="contact-link-value">linkedin.com/in/swapnil-kadam</div></div></a>
            <a href="https://github.com/swapnilk1806/" target="_blank" rel="noopener noreferrer" className="contact-link"><div className="contact-link-icon">🐙</div><div><div className="contact-link-label">GitHub</div><div className="contact-link-value">github.com/swapnilk1806</div></div></a>
            <a href="https://leetcode.com/u/swapnilk1806/" target="_blank" rel="noopener noreferrer" className="contact-link"><div className="contact-link-icon">🧩</div><div><div className="contact-link-label">LeetCode</div><div className="contact-link-value">leetcode.com/u/swapnilk1806</div></div></a>
          </div>
          <div className="glass contact-form" style={{ padding: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, letterSpacing: -0.3 }}>Send a Message</div>
            <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" type="text" placeholder="John Doe" /></div>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="john@company.com" /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Tell me about the role or project..." /></div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }} onClick={(e) => e.preventDefault()}>Send Message<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg></button>
          </div>
        </div>
      </section>

      {/* Footer – updated tags */}
      <footer>
        <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16, letterSpacing: -0.5 }}>Swapnil Kadam</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>{["Java","Spring Boot","MERN","AWS","Microservices","Kafka","Python","LLM","React Native"].map((t) => (<span className="tag" key={t}>{t}</span>))}</div>
        <p className="footer-text">© {new Date().getFullYear()} Swapnil Kadam. Built with React + TypeScript.</p>
        <p className="footer-text" style={{ marginTop: 8 }}>Open to Software Engineer roles &amp; collaborations worldwide.</p>
      </footer>
    </>
  );
}