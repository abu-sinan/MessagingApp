```markdown
# MyMessenger - Real-time Chat Application

A full-stack real-time messaging application built with React, Node.js, Express, Socket.IO, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💬 **Real-time Messaging** - Instant messaging with Socket.IO
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🌙 **Dark/Light Mode** - Toggle between themes
- 👥 **Online Status** - See who's online in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- ✅ **Read Receipts** - See when messages are delivered and read
- 🖼️ **Avatar Upload** - Profile pictures with Cloudinary
- 📲 **Notifications** - Toast notifications for better UX

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- React Router
- Framer Motion
- React Hot Toast

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Cloudinary for image uploads

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for avatar uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd messaging-app
```

1. Setup Backend
   ```bash
   cd server
   npm install
   ```
2. Setup Frontend
   ```bash
   cd ../client
   npm install
   ```
3. Environment Configuration
   Create server/.env:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/messaging_app
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Start the Application
   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```
   Terminal 2 - Frontend:
   ```bash
   cd client
   npm run dev
   ```
5. Access the Application
   · Frontend: http://localhost:5173
   · Backend: http://localhost:5000

Project Structure

```
messaging-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Server entry point
└── README.md
```

API Endpoints

Authentication

· POST /api/auth/register - User registration
· POST /api/auth/login - User login

Users

· GET /api/users - Get all users
· GET /api/users/:id - Get user by ID
· PUT /api/users/profile - Update user profile
· POST /api/users/avatar - Upload avatar

Messages

· GET /api/messages/:userId - Get messages with user
· PUT /api/messages/read/:senderId - Mark messages as read

Socket.IO Events

Client to Server

· send_message - Send a new message
· typing_start - Start typing indicator
· typing_stop - Stop typing indicator
· mark_messages_read - Mark messages as read

Server to Client

· new_message - Receive new message
· message_sent - Message sent confirmation
· user_typing - User typing status
· messages_read - Messages read confirmation
· user_online - User came online
· user_offline - User went offline

Features in Detail

Real-time Communication

· Instant message delivery using Socket.IO
· Typing indicators
· Online/offline status
· Read receipts

Security

· Password hashing with bcrypt
· JWT token authentication
· Protected routes and socket connections
· Input validation

User Experience

· Responsive design for all devices
· Dark/light mode toggle
· Smooth animations
· Toast notifications
· Loading states

Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

License

This project is licensed under the MIT License.

```

**/messaging-app/.env**
```env
# This is the root .env file - copy these values to server/.env

# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/messaging_app

# JWT Secret (change this in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

Installation and Setup Instructions

To get this real-time messaging application running locally:

1. Create the project directory and copy all the files into their respective folders
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```
4. Set up environment variables in server/.env (use the template from root .env)
5. Start MongoDB locally or use MongoDB Atlas
6. Create a Cloudinary account and add your credentials to the environment variables
7. Run the backend:
   ```bash
   cd server
   npm run dev
   ```
8. Run the frontend (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```
9. Access the application at http://localhost:5173

The application includes:

· ✅ User registration and login
· ✅ Real-time messaging with Socket.IO
· ✅ Online/offline status
· ✅ Typing indicators
· ✅ Read receipts
· ✅ Responsive design
· ✅ Dark/light mode
· ✅ Avatar upload functionality
· ✅ Modern UI with Tailwind CSS
· ✅ JWT authentication
· ✅ MongoDB persistence

All code is complete and ready to run immediately after installation!
# MessagingApp
