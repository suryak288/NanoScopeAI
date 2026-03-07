# NanoScope AI

## Project Overview
NanoScope AI is a sophisticated scientific analysis portal designed to process, analyze, and visualize high-resolution microscopic imagery. It leverages an automated vision pipeline to detect nanoscale entities, calculate morphology metrics, and generate detailed particle distribution insights. The platform provides researchers and students with a clean, dynamic, glassmorphism-inspired interface for managing their analysis history and exporting comprehensive PDF reports.

## Features
- **Intelligent Image Analysis**: Automated processing pipeline measuring element size, standard deviation, and uniformity.
- **Dashboard Analytics**: Real-time aggregated metrics showcasing total analyses, detected elements, average element size, and processing times.
- **Trial Usage Limits**: Track and limit analysis pipelines per account (e.g., Trial vs Student).
- **Subscription Plans**: Different tiers providing varying levels of access (Trial, Student, Research).
- **PDF Report Export**: Generate and download professional scientific reports containing Original vs Annotated imagery and metric charts directly from the dashboard.
- **User Authentication**: Secure JWT-based authentication supporting account creation and login flows.
- **Interactive Visualization**: Extensive Size Distribution (Bar Chart) and Morphology Analysis (Pie Chart) powered by Recharts.

## Technology Stack
**Frontend:** 
- React.js + Vite
- Tailwind CSS (with advanced Glassmorphism design)
- React Router DOM
- Recharts
- Lucide React (Icons)

**Backend:**
- Node.js + Fastify
- Prisma ORM
- PDFKit (Report Generation)
- JSON Web Tokens (JWT)
- Local File Uploads (`@fastify/multipart` / `@fastify/static`)

**Database:**
- PostgreSQL (Hosted via Neon)

## Installation Guide

Follow these steps to run NanoScope AI locally on your machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- A PostgreSQL database string (e.g., from Neon, Supabase, or local)

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Initialize the Prisma database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will typically start on `http://localhost:3001`.*

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically start on `http://localhost:5173`.*

## Environment Variables
The application requires certain environment variables to function correctly. 

Create a `.env` file in your `/server` directory and add the following:

```env
# The connection string to your PostgreSQL database
DATABASE_URL="postgresql://user:password@host/database_name?sslmode=require"

# A secure secret key used to sign JSON Web Tokens
JWT_SECRET="your_super_secret_jwt_key_here"
```

## Folder Structure

```text
nanoscope-ai/
├── client/                 # React Frontend Codebase
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Sidebar, ProtectedRoute)
│   │   ├── context/        # React Context providers (AuthContext)
│   │   ├── layouts/        # Page layouts (DashboardLayout)
│   │   ├── pages/          # Full page views (Dashboard, Results, Analysis, History, etc.)
│   │   └── utils/          # Helper functions (Tailwind cn merger)
│   └── index.css           # Global Tailwind & Glassmorphism styles
│
├── server/                 # Fastify Backend Codebase
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── services/       # Core business logic (ai.service, auth.service, pdf.service)
│   │   └── index.ts        # Main Fastify server, routing, and upload handling
│   └── uploads/            # Local directory where uploaded and analyzed images are stored
```

## Future Improvements
The NanoScope AI platform is continually evolving. Some planned future enhancements include:
- **Real AI Particle Detection**: Integrating Python-based computer vision microservices (e.g., OpenCV, PyTorch) via a dedicated inference API or child processes to replace simulated logic.
- **Cloud Storage Integration**: Migrating local file uploads to scalable cloud solutions like AWS S3 or Google Cloud Storage to handle larger datasets across distributed servers.
- **Dataset Comparison**: Adding features to compare metrics across multiple analyses side-by-side or track changes in material composition over sequential datasets.