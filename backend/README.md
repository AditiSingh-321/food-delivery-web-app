# Food Delivery Backend

Complete, production-ready backend for a Food Delivery Application.

## Tech Stack
- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.io (Real-time updates)
- Cloudinary (Image uploads)
- JWT Authentication

## Setup & Run Locally

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Rename `.env.example` to `.env` and fill in your credentials.
4. Run `npm run dev` to start the server in development mode.

## Features
- **Roles:** CUSTOMER, RESTAURANT_OWNER, ADMIN
- **Auth:** JWT Access & Refresh Tokens
- **Real-time:** Socket.io for Order Lifecycle
- **Security:** Helmet, CORS, Rate Limiting
- **Emails:** Nodemailer for Verification & Password Resets

## Deployment
This project is configured for easy deployment on Render, Heroku, Railway, or VPS. Ensure all environment variables are provided in the production environment. Set `NODE_ENV=production`. Use `npm start` to run the production server.
