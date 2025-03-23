# Smart Waste Management App - SGH_CLEANBAGE

## 🏗️ Project Overview
This is a **Smart Waste Management System** designed for **Jamnagar Municipal Corporation (JMC)**. The platform helps residents report waste collection issues, allows garbage collectors to manage pickups, and provides administrators with insights into waste management operations.

## 📁 Project Structure
```
SGH_CLEAN/
│── backend/            # Node.js (Express) Backend
│   ├── config/         # Configuration files (DB, env, etc.)
│   ├── controllers/    # Route handlers and business logic
│   ├── middlewares/    # Custom middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── public/         # Public assets
│   ├── .env            # Environment variables
│   ├── .gitignore      # Ignored files
│   ├── app.js          # Main backend entry
│   ├── package.json    # Backend dependencies
│
│── frontend/           # React (Vite) Frontend
│
│── Readme.md           # Project documentation
```

## 🚀 Features
- **User Roles:** Resident, Garbage Collector, Admin
- **User Authentication:** Secure login/signup system
- **Reporting Issues:** Residents can report uncollected waste
- **Task Management:** Admins assign and track garbage collection tasks
- **Real-time Location Tracking:** Garbage collectors update their location (to be added with WebSockets)
- **Dark Mode / Light Mode**

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB (Atlas)
- **Database:** MongoDB Atlas (Cloud Database)
- **Authentication:** JWT (JSON Web Tokens)
- **API Integration:** Google Maps API
- **Deployment:** (To be decided)

## ⚡ Setup Guide
### 1️⃣ Backend Setup
```sh
cd backend
npm install
npm start
```
**Environment Variables (`.env`):**
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
JWT_SECRET=your_secret_key
```

### 2️⃣ Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

## 📌 Future Enhancements
- 📍 **Live Tracking** using WebSockets
- 📊 **Admin Dashboard** with analytics
- 📱 **Mobile Responsive UI**
- 📦 **Optimized Database Queries** for large-scale data

---
**👨‍💻 Contributors:** _CleanBage & Team._

🚀 *Let's make waste management smarter!*

