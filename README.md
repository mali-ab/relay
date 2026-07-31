# Relay

> **Relay** is a sleek, lightweight, and minimalistic online video conferencing platform. This application integrates a high-performance **Go (Golang)** backend with a modern **React & TypeScript** frontend, embedding **Jitsi Meet** for seamless, low-latency video and audio communication.

---

## 🚀 Key Features

* **High-Performance Backend**: Developed with Go (Golang) for rapid response times and scalable API handling.
* **Modern Minimalistic UI**: Built using React, TypeScript, and Tailwind CSS with custom glassmorphic styling.
* **Integrated Video Conferencing**: Embedded Jitsi Meet WebRTC platform for smooth audio/video calling, screen sharing, and interactive meetings.
* **Real-time Chat & Roster Management**: In-meeting chat powered by Jitsi's XMPP/Prosody data routing along with real-time participant sidebars.
* **Authentication & Dashboard**: Secure user authorization flow via Axios alongside intuitive meeting management dashboards.

---

## 🏗️ Tech Stack

* **Frontend**: React, TypeScript, Tailwind CSS, Axios, React Router
* **Backend**: Go (Golang)
* **Media & Signaling**: Jitsi Meet (JVB, Jicofo, Prosody) embedded via Jitsi External API
* **Containerization**: Docker & Docker Compose 

---

## 📂 Project Structure

```text
relay/
├── backend/                  # Go (Golang) API server & REST controllers
│   ├── main.go               # Application entrypoint & HTTP routes
│   └── ...
├── frontend/                 # React & TypeScript client application
│   ├── src/
│   │   ├── components/       # Reusable UI widgets & meeting controls
│   │   │   ├── dashboard/    # Dashboard statistics & activity cards
│   │   │   └── meetings/     # Video grid, header, chat, and participant sidebars
│   │   ├── contexts/         # React Contexts (AuthContext, JitsiRoomContext)
│   │   ├── lib/              # Axios instance configuration
│   │   ├── pages/            # Views (Dashboard, MeetingRoom, Login, NotFound)
│   │   └── App.tsx
│   └── package.json
└── jitsi/                    # Docker deployment configurations for Jitsi Meet

```

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org/) (v18+) & `npm` / `yarn`
* [Go](https://golang.org/) (v1.20+)
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) 

---

### Setup Instructions

#### 1. Go Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Go dependencies
go mod tidy

# Start the Go server
go run main.go

```

#### 2. React Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Create local environment configuration
cp .env.example .env

# Start the Vite development server
npm run dev

```

#### 3. Jitsi Meet Docker Setup

For local WebRTC media routing, deploy the stable Jitsi stack using Docker:

```bash
# Navigate to jitsi directory
cd jitsi

# Clone the official Docker Jitsi setup if running self-hosted media server
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet

# Create environment template and auto-fill secure passwords
cp env.example .env
./gen-passwords.sh

# Start Jitsi Meet services
docker compose up -d

```

---

## 🔐 Environment Variables

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_JITSI_DOMAIN=meet.jit.si

```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.