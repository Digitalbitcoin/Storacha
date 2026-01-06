# Storacha Upload Demo

![Storacha](https://img.shields.io/badge/Storacha-Red-e53e3e?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.4-purple?style=for-the-badge&logo=vite)

A modern web application for uploading files to decentralized IPFS storage using the Storacha SDK. This demo application provides a user-friendly interface for file uploads with real-time progress tracking and secure delegation-based authentication.

## ✨ Features

- **🌐 Decentralized Storage**: Upload files to IPFS with Filecoin persistence
- **🔐 Secure Authentication**: Delegation-based access control
- **📁 Drag & Drop Interface**: Intuitive file upload with visual feedback
- **🚀 Real-time Progress**: Live upload tracking with status updates
- **🎨 Modern UI**: Beautiful red-themed interface with smooth animations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🔗 Instant Sharing**: Generate IPFS gateway URLs for uploaded files

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- A Storacha account (for delegation credentials)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Digitalbitcoin/Storacha.git
cd storacha
cd UCAN-Expert

UCAN-Expert/
├── src/
│   ├── components/
│   │   └── Uploader.tsx     # Main upload component
│   ├── hooks/
│   │   └── useStoracha.ts   # Storacha SDK integration
│   ├── lib/
│   │   └── api.ts           # API integration
│   ├── App.tsx              # Main application
│   ├── App.css              # Global styles
│   ├── main.tsx             # Global styles
│   └── vite-env.d.ts        # vite
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md

npm i

npm run dev
