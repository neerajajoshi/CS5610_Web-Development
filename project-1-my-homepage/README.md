
# Neeraja Joshi Portfolio

A portfolio website built entirely using **Vanilla HTML5**, **CSS3**, and **ES6+ JS Modules**. Designed with modern glassmorphism, responsive visual grids, and custom interactive visual mathematics.

---

## Project Overview

- **Author**: Neeraja Joshi
- **Class Link**: [CS5610 Web Development (Summer 2026) at Northeastern University](https://northeastern.instructure.com/courses/249954)
- **Project Objective**: To build a clean, responsive professional portfolio that showcases my academic background, software engineering internships, research publications, and an interactive AI dentistry sandbox.
- **Project Design Mockups**: Outlined fully in the companion [Design Document](documents/design_document.md).
- **License**: [MIT License](LICENSE)

### Portfolio Screenshots

Here are the screenshots showcasing the pages and key components of the completed portfolio:

#### 1. Homepage & Hero Section

![Homepage Hero](documents/screenshots/screenshot%201%20homepage.png)

#### 2. My Journey Timeline (Academic vs. Industry)

![My Journey Timeline](documents/screenshots/screenshot%202%20my%20journey.png)

#### 3. Core Technical Strengths

![Core Skills Grid](documents/screenshots/screenshot%203%20core%20skills.png)

#### 4. Academic Publications

![Academic Publications](documents/screenshots/screenshot%204%20academic%20publications.png)

#### 5. AI / Machine Learning Projects Filter

![AI/ML Projects Filter](documents/screenshots/screenshot%205%20ML%20projects.png)

#### 6. Full-Stack Web Projects Filter

![Full-Stack Web Projects Filter](documents/screenshots/screenshot%206%20SE%20projects.png)

#### 7. SmileSculpt AI Sandbox (Original Teeth Alignment State)

![SmileSculpt Original Canvas](documents/screenshots/screenshot%207%20ai%20genearted%20page%201.0.png)

#### 8. SmileSculpt AI Sandbox (Aligned & Whitened Teeth Transformation)

![SmileSculpt Transformation Canvas](documents/screenshots/screenshot%208%20ai%20genearted%20page%202.0.png)

#### 9. Light Mode Interface Option

![Light Mode Theme Option](documents/screenshots/screenshot%209%20light%20mode.png)

---

## Pages Overview

This portfolio has three pages, each with a different build approach:

- **`index.html`** — The homepage. Built entirely by me from scratch. Includes a hero section with my bio and CV download, a dual-column journey timeline (Academic vs. Industry), a technical skills grid, and a publications section.
- **`projects.html`** — The projects showcase. Also built by me. Features a filter grid letting visitors toggle between AI/ML and full-stack web projects.
- **`smilesculpt.html`** — The AI-generated third page. This page was scaffolded and generated using an AI assistant (Gemini). It houses an interactive HTML5 canvas sandbox that simulates aesthetic dental transformations based on my published research.

## Original JS Feature

The SmileSculpt sandbox (`js/smileeditor.js`) is a custom-built canvas engine I wrote without any external libraries:

- Draws a stylized face with skin-tone presets and adjustable mouth parameters.
- Implements a **draggable split before/after viewport** — you drag a central handle to compare the "before" (misaligned, yellowish) teeth state vs. the "after" (aligned, whitened) state.
- Uses **quadratic Bezier curves** for the upper and lower lips.
- Calculates individual tooth positions along a curved arch with staggered offsets when alignment is low.
- Responds to real-time slider changes for brightness, alignment, and buccal corridor width.

---

## Project Architecture & Organization

The project directory is structured cleanly to isolate style tokens, scripts, and vector assets:

```text
portfolio/
├── .gitignore              # Files and folders to ignore in Git
├── .prettierrc             # Strict Prettier formatter configuration
├── eslint.config.js        # Standard flat ESLint rules
├── LICENSE                 # MIT License details
├── package.json            # ESM module declarations & run commands
├── README.md               # Complete project documentation
├── documents/              # Project documentation folder
│   ├── design_document.md  # User Personas, User Stories, and wireframes
│   └── screenshots/        # Project screenshots for grading verification
└── frontend/               # Complete source code of the web application
    ├── index.html          # Core home page (Hero, Timeline, Skills, Publications)
    ├── projects.html       # Honeycomb-filtered project grid
    ├── smilesculpt.html    # SmileSculpt AI Split-Slider Dentistry Sandbox
    ├── css/
    │   └── style.css       # Modern dark-default HSL vars, flex layouts, no !important
    ├── images/             # Vector icons and other image assets
    └── js/
        ├── main.js         # ESM core coordinator & element selectors hook
        ├── smileeditor.js  # Teeth alignment and before/after split slider engine
        └── theme.js        # Light/Dark mode localStorage cache manager
```

---

## Instructions to Build and Run Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Navigate to the Project Folder**:

   ```bash
   cd portfolio
   ```

2. **Install Development Tools**:
   Install ESLint, Prettier, and the local developer serving tool:

   ```bash
   npm install
   ```

3. **Launch the Development Server**:
   Run the package script to spin up the local server instantly:

   ```bash
   npm start
   ```

   _Note: This command will host the static files on `http://localhost:3000` and automatically copy the local address to your clipboard._

4. **Verify Standards and Linters**:
   - **Prettier Format Check**: Run Prettier to clean code styling:
     ```bash
     npm run format
     ```
   - **ESLint Code Check**: Run ESLint to verify module exports and strict syntax compliance:
     ```bash
     npm run lint
     ```

---

## Generative AI Usage

I used AI assistance specifically for the **third page (`smilesculpt.html`)**, which was the AI-generated page required by the assignment. The homepage (`index.html`) and the projects page (`projects.html`) were written by me.

- **Model Used**: Gemini 3.5.
- **What it was used for**: Generating the initial structure and layout of `smilesculpt.html`, drafting the `smileeditor.js` canvas rendering logic for the split-screen dental sandbox, and helping me set up the ESLint flat config file for ES6 browser modules.
- **Example prompts I used**:
  - _"Build me a draggable before/after split viewer on an HTML5 canvas that shows misaligned yellowish teeth on the left and aligned white teeth on the right based on a slider."_
  - _"Create a flat ESLint config for a vanilla JS ES6 browser project with no Node.js globals."_
- **What I changed**: I reviewed all generated code and adapted it to match my custom HSL CSS variables, removed any unnecessary boilerplate, and integrated it with the shared `style.css` and `main.js` modules I had already written.
=======
# CS5610_Web-Development
Course repository for Web Development containing projects, assignments, and portfolio-based applications developed using modern web technologies.
>>>>>>> 4c0a2ac106dacf3f6076d3a3f6ceb24288107b2a
