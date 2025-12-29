# Alum_Connect MERN MVP

A organic, interest-driven mentorship platform for alumni and students.

## Project Structure
- `backend/`: Node.js + Express REST API (MongoDB/Mongoose)
- `frontend/`: React SPA (Vite + Tailwind CSS)

## Setup Instructions

### Backend
1. Navigate to `backend/`
2. Run `npm install`
3. Create a `.env` file (see `.env.example`)
4. Run `npm run dev` to start the development server (port 5000)

### Frontend
1. Navigate to `frontend/`
2. Run `npm install`
3. Run `npm run dev` to start the Vite dev server

## Core Features Implemented
- **JWT Authentication**: Secure login and signup.
- **Profile Management**: Education, skills, and engagement scores.
- **Discovery**: Search and filter profiles by domain/year.
- **Connection Logic**: Send and accept mentorship requests.
- **Automated Workspaces**: Workspace creation upon mutual connection.
- **Engagement Scoring**: Activity-based ranking for better discovery.

## Storage
Media URLs are stored in MongoDB. For production, integrate S3 or Firebase for file/video uploads.
