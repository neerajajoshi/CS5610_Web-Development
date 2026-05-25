# Portfolio Design Document

This document walks through the thinking, user research, and technical decisions behind my personal portfolio website. My goal was to create a space that shows both my background in full-stack software development and my research in spatial AI, without relying on heavy frameworks or templates.

---

## 1. Project Description

When I started planning this portfolio, I wanted to build something fast, modern, and built entirely from scratch. Instead of using React templates or heavy UI libraries that make every developer portfolio look identical, I decided to use vanilla **HTML5, CSS3, and ES6+ JavaScript modules**.

The portfolio has three pages:

- **Homepage (`index.html`)** — Built by me from scratch. Covers my background, journey timeline, technical skills, and publications.
- **Projects (`projects.html`)** — Also built by me. A filterable grid of my software projects, separable by AI/ML and full-stack web categories.
- **SmileSculpt AI Sandbox (`smilesculpt.html`)** — The AI-generated third page, created with Gemini. Hosts the interactive canvas sandbox based on my published dental research.

### Key Highlights:

- **No Framework Overhead**: Every animation, layout grid, and feature runs directly in the browser using raw web standards. This keeps page loads nearly instantaneous.
- **Glassmorphic Theme**: A modern CSS design featuring custom HSL color systems, blurred backdrops, and active light/dark mode persistence via localStorage.
- **AI Dentistry Sandbox**: The third page is the AI-generated one. It showcases my research paper published in _Procedia Computer Science_ via a custom interactive canvas where visitors can play with teeth alignment parameters in real-time.
- **W3C and Clean Code Compliant**: The site conforms to strict markup standards, avoids `!important` CSS overrides, and passes static ESLint checks.

---

## 2. Target Audience (User Personas)

I wanted to ensure my portfolio speaks directly to the different types of professionals who might visit my page.

### Persona A: Sarah (The High-Volume Technical Recruiter)

- **Background**: Senior technical recruiter hiring computer science interns for a software firm in Boston.
- **Needs**: She wants to quickly verify my programming languages, check my graduation timeline, and download my resume without dealing with broken links.
- **Frustrations**: Slow-loading portfolios, flash-heavy animations that lag on mobile, and resume download links that redirect to locked Google Drive folders.
- **My Solution**: A minimal, clean header with a direct "Download CV" action button. The page loads instantly on mobile so she can get my PDF resume on the go.

### Persona B: Dr. Chen (The Computer Vision Professor)

- **Background**: Academic researcher looking for graduate research assistants to join his spatial computing laboratory.
- **Needs**: He needs to see if I have real mathematical depth, understands deep learning architectures, and has peer-reviewed publications.
- **Frustrations**: Applicants who list "Machine Learning" as a keyword but can't explain shape completion, Chamfer distances, or neural textures.
- **My Solution**: A dedicated, clean Publications section with direct DOI hyperlinks, paired with detailed descriptions of generative models and local LLM configurations.

### Persona C: Dr. Patel (The Biotech Startup Co-Founder)

- **Background**: Orthodontist and clinical director of an AI-driven dental technology startup.
- **Needs**: He wants to see if I can translate complex medical imaging or diffusion concepts into interactive, user-friendly software.
- **Frustrations**: Research papers that are too dense to parse or codebases that require local GPU setups just to see a basic visual mockup.
- **My Solution**: An interactive "Smile AI Sandbox" page where he can play with orthodontic adjustment parameters on an active canvas and drag a split-slider to see the transformation in real-time.

---

## 3. User Journeys (Stories)

### Story 1: Devanshi's 30-Second Resume Review

> Devanshi is commuting on the MBTA Green Line in Boston and scanning student applications on her phone. She taps my portfolio link.
>
> The page loads immediately. She sees my name, university, and the prominent CV download button right away. She clicks "Download CV" and the formatted PDF saving my credentials downloads directly. She scrolls down, notices my structured technical skills categories, and bookmarks my profile to schedule a phone screen.

### Story 2: Dr. Chen Validating Research Background

> Dr. Chen is sorting through candidates for a research opening. He wants to see if I have concrete experience with 3D models and point clouds.
>
> He navigates to my **Projects** page, finds the _SmileSculpt AI Dentistry Design_ project card, and clicks "Interactive AI Sandbox." He reads about my implementation of localized masking constraints, plays with the alignment and buccal corridor sliders, and then clicks the DOI link to view the published paper on ScienceDirect.

---

## 4. Visual Layout & Mockups

The interface focuses on deep slate backdrops, custom indigo accent gradients, and frosted glass navigation modules.

### Homepage Mockup Reference

Here is the visual layout mockup for the homepage showing the navigation header, hero introduction, dual-column timeline grid, and technical skills:

![Homepage Layout Mockup](../frontend/images/screenshot.png)

### Layout Specifications:

- **Timeline Row Alignment**: The Academic and Industry journeys are organized side-by-side in matching rows on desktop. They share a single CSS Grid container, meaning adjacent cards stretch to identical heights regardless of description length.
- **Clean Skills Grid**: Skills are listed in clean category boxes with custom glowing accent bullet-dots, keeping the interface uncluttered.
- **Draggable Sandbox Canvas**: The sandbox viewport features an interactive split-screen divider with a central handle, letting users compare before/after states seamlessly.
