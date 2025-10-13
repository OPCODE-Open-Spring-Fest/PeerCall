

# PeerCall — Modern, Secure Real-Time Video Chat 🎥🔒

![Project Status: Active](https://img.shields.io/badge/status-active-brightgreen)  
![License: MIT](https://img.shields.io/badge/license-MIT-blue)  
![GitHub Issues](https://img.shields.io/github/issues/OPCODE-Open-Spring-Fest/PeerCall)  
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/OPCODE-Open-Spring-Fest/PeerCall)  
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)  

> A community-driven, secure, real-time video chat app built with web technologies.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Vision and Design Principles](#vision-and-design-principles)
- [Goals & Non-Goals](#goals--non-goals)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Testing & Quality Gates](#testing--quality-gates)
- [Contributing](#contributing)
- [Issue & Release Process](#issue--release-process)
- [Branching & Git Workflow](#branching--git-workflow)
- [PR Template & Review Checklist](#pr-template--review-checklist)
- [Code Style Guide](#code-style-guide)
- [Security & Licensing](#security--licensing)
- [Roadmap](#roadmap)
- [Project Governance](#project-governance)
- [Maintainers & Contact](#maintainers--contact)
- [Acknowledgements](#acknowledgements)

---

## Project Overview

**PeerCall** delivers secure, privacy-respecting, real-time video communication combining peer-to-peer WebRTC with solid authentication and session management.

### Watch PeerCall in action:

![WebRTC Video Call Demo](https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif)  
*A smooth real-time WebRTC video call experience.*

![Screen Sharing Demo](https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif)  
*Seamless screen sharing capability.*

---

## Vision and Design Principles

- 🚀 **Easy onboarding:** Clone, run, and start developing quickly.  
- 🤝 **Community-first:** Open governance and transparent development.  
- 🔒 **Security:** Token rotation, secure sessions, HTTP-only cookies.  
- ⚡ **Performance:** Responsive, efficient, modern browser compatibility.

---

## Goals & Non-Goals

| **Goals**                                            | **Non-Goals**                                |
| ----------------------------------------------------|---------------------------------------------|
| Secure, user-friendly video chat platform            | Enterprise-level scaling out-of-the-box     |
| Clear and welcoming contribution process             | Polished final UI/UX design                  |
| Strong CI/CD pipelines and reproducible builds       | Complex SFU cluster deployments initially   |

---

## Key Features

- 🔐 Secure sign-up/sign-in with refresh token rotation  
- 🔗 Create/join rooms using short shareable links  
- 🎥 WebRTC peer-to-peer media (audio/video) with mute & toggle controls  
- 💬 In-call chat overlay for messaging during video calls  
- 📱 Device & session listing with revocation for security  
- 🔄 Lightweight backend for authentication, signaling, and presence

---

## Tech Stack

### Frontend  
- React + TypeScript  
- [Vite](https://vitejs.dev/)  
- [Framer Motion](https://www.framer.com/motion/) for animations  
- CSS Modules / Tailwind CSS  

### Backend  
- Node.js + TypeScript  
- Express or NestJS  
- MongoDB or PostgreSQL  
- JWT + httpOnly cookie session management  

### Real-Time  
- WebRTC for media streams  
- socket.io or WebSocket for signaling & presence  

### Tooling  
- ESLint, Prettier for code quality  
- Jest or Vitest for unit testing  
- GitHub Actions for CI/CD  

---

## Architecture Overview

```

graph TD
Client[Client (Browser)]
Server[API \& Signaling Server]
Database[Database]

Client -->|Requests Access Token| Server
Client -->|WebRTC Signaling \& Media| Server
Server -->|Stores Sessions \& Tokens| Database

```
*Architecture components of PeerCall showing how client, signaling server, and database interact.*

---

## Folder Structure

```

/
├─ README.md
├─ LICENSE
├─ .github/
├─ frontend/
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ server/
│  ├─ src/
│  └─ package.json
├─ scripts/
└─ tests/

```

---

## Getting Started

### Prerequisites  
- Node.js >= 18  
- npm >= 9 or Yarn  

### Clone and install

```

git clone https://github.com/OPCODE-Open-Spring-Fest/PeerCall.git
cd PeerCall
cd frontend
npm install
cd ../server
npm install

```

### Setup environment variables  

- Copy `.env.example` to `.env` in both `frontend` and `server` folders and fill in the required values.

### Run local servers

```


# Run backend API server

cd server \&\& npm run dev

# Run frontend dev server (open new terminal)

cd ../frontend \&\& npm run dev

```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## Testing & Quality Gates

- ✅ Type-check: `npm run type-check`  
- ✅ Linting: `npm run lint` (`npm run lint:fix` to fix issues)  
- ✅ Unit Tests: `npm run test`  
- ✅ Build verification: `npm run build`  
- ✅ Continuous Integration with GitHub Actions on all PRs and main branch.

---

## Contributing

Please read our [Contribution Guide](./CONTRIBUTING.md) for detailed instructions. Quick start:

1. Pick an issue labelled `good first issue` or `help wanted`.  
2. Fork and create a feature branch: `git checkout -b feat/awesome-feature`  
3. Commit often with clear, conventional commit messages.  
4. Run tests and linting locally before PR.  
5. Open a PR referencing relevant issues and describe your changes.  
6. Engage in code review until PR is approved and merged.

---

## Issue & Release Process

- Use descriptive labels like `type: bug`, `area: frontend`, `help wanted` etc.  
- File issues using templates for reproducibility.  
- Releases follow semantic versioning. Changelog auto-generated.

---

## Branching & Git Workflow

- Feature branches use prefixes like `feat/`, `fix/`, `chore/`, and `docs/`.  
- PRs should be concise and pass all CI checks.  
- Rebase to keep history clean before merging.

---

## PR Template & Review Checklist

```


## Summary

## Related Issues

## How to Test

- [ ] CI passes
- [ ] Code style \& tests updated

```

---

## Code Style Guide

- Strict TypeScript typing – use `readonly` and `unknown` when appropriate  
- ESLint and Prettier enforced for consistency  
- Modular, testable, focused components and functions  
- Clear API typings on exports and interfaces

---

## Security & Licensing

- Responsible Disclosure guidelines in `SECURITY.md`  
- Contributor Code of Conduct in `CODE_OF_CONDUCT.md`  
- Licensed under MIT (see the `LICENSE` file)

---

## Roadmap

- v0.1: MVP - authentication + basic peer-to-peer WebRTC calls  
- v0.2: Session management, chat overlay, UI improvements, e2e tests  
- v1.0: Accessibility audit, stability enhancements, optional SFU integration

---

## Project Governance

Community-driven with maintainer oversight. Contributions, discussions, and feedback are welcomed to shape project direction.Please star the repo
---

## Maintainers & Contact

- Project Manager: [@04shubham7](https://github.com/04shubham7)  


---

## Acknowledgements

Thanks to all [PeerCall contributors](https://github.com/OPCODE-Open-Spring-Fest/PeerCall/graphs/contributors), WebRTC community ([webrtc.org](https://webrtc.org/)), and open-source projects making this possible.

