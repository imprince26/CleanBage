# CleanBage

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express.js-4.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646cff.svg)](https://vitejs.dev/)

---

## Overview

**CleanBage** is a full-stack waste management platform designed to streamline urban waste collection operations. The application connects residents, garbage collectors, and administrators through dedicated role-based dashboards, enabling efficient bin reporting, collection scheduling, route management, and performance tracking.

---

## Key Features

### Authentication & User Management
- JWT-based authentication with HTTP-only cookie sessions
- Google OAuth 2.0 integration for social login
- Email verification system with token-based confirmation
- Password reset functionality via email
- Role-based access control (Resident, Garbage Collector, Admin)

### Resident Portal
- **Interactive Bin Map** — Leaflet.js-powered map with geolocation, radius-based search, and waste type filtering
- **Bin Reporting** — Report bin status with image uploads via Cloudinary
- **Collection Tracking** — View collection history and upcoming schedules
- **Reward System** — Earn points for reporting bins, redeem rewards from the store
- **Leaderboard** — Community rankings based on reward points
- **Feedback Submission** — Submit and track feedback on services, collectors, and bins

### Collector Portal
- **Assigned Bins Management** — View and manage assigned bins with fill level indicators
- **Route Management** — Access active routes with waypoint navigation
- **Collection Scheduling** — Calendar view of scheduled collections with time slots
- **Report Submission** — Submit collection reports with before/after photo uploads
- **Performance Dashboard** — Track collection statistics and activity history

### Admin Portal
- **User Management** — Create, edit, and manage users across all roles
- **Bin Management** — Add, update, and monitor bins with location mapping
- **Route Configuration** — Create and optimize collection routes with start/end locations
- **Schedule Management** — Assign collectors, set recurring schedules, and manage time slots
- **Report Analytics** — View collection reports with waste volume and category breakdowns
- **Feedback Moderation** — Review, respond to, and manage user feedback
- **Reward Administration** — Manage reward items, point allocations, and redemptions
- **System Analytics** — Dashboard with performance metrics and collection statistics

### Notification System
- Notifications for collection events, rewards, and system announcements
- Priority-based notification levels (low, medium, high, urgent)
- Notification expiry management

### Data Management
- Waste categorization (organic, recyclable, non-recyclable, hazardous, mixed)
- Fill level tracking with overflow alerts
- Collection history with timestamps and collector details
- Maintenance tracking and issue reporting

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Radix UI, React Hook Form, Zod, Recharts, Leaflet.js, Framer Motion |
| **Backend** | Node.js, Express.js, Passport.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT, Google OAuth 2.0, Bcrypt |
| **File Storage** | Cloudinary |
| **Email Service** | Nodemailer |
| **Scheduling** | node-cron |
| **Maps** | Leaflet.js with OpenStreetMap |

---

## Links

- **Live Demo:** [Click here](https://clean-bage.vercel.app)
- **GitHub Repository:** [Click here](https://github.com/imprince26/CleanBage)