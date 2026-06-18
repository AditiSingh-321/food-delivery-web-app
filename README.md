# Tomato. - Food Delivery Web App 🍅

A full-stack, production-ready food delivery application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time order tracking.

## 📸 Screenshots

### Home Page
![Home Page](./screenshots/1.png)
*A beautiful landing page to welcome users and showcase the menu.*

### Food Menu
![Food Menu](./screenshots/2.png)
*Browse through a diverse menu of delicious dishes.*

### User Profile
![User Profile](./screenshots/3.png)
*User dashboard to manage profile details and view order history.*

### Admin Dashboard
![Admin Dashboard](./screenshots/4.png)
*A comprehensive dashboard for restaurant owners to manage orders, track revenue, and monitor deliveries.*

### My Orders
![My Orders](./screenshots/5.png)
*Track the status of your current and past orders.*

## ✨ Features

* **User Authentication:** Secure login and registration using JWT.
* **Browse & Order:** View restaurant menus, add items to the cart, and place orders.
* **Real-Time Tracking:** Track order status in real-time (Preparing, Out for Delivery, Delivered) powered by Socket.io.
* **Admin/Restaurant Dashboard:** Manage incoming orders, update statuses, and view revenue analytics.
* **Responsive Design:** A beautiful UI that works perfectly on desktop and mobile devices.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), React Router, Context API
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Real-time:** Socket.io
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Image Hosting:** Cloudinary

## 🚀 Deployment Setup

Since this project is organized in a single repository (monorepo), here is how to deploy it:

### Frontend (Vercel)
1. Import this repository into [Vercel](https://vercel.com/).
2. In the "Root Directory" settings, click Edit and select the `frontend` folder.
3. Add the required Environment Variable: `VITE_API_URL` pointing to your deployed backend URL (with `/api/v1` appended).
4. Deploy!

### Backend (Render)
1. Create a New Web Service on [Render](https://render.com/) and connect this repository.
2. In the setup settings, scroll to "Root Directory" and type `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js` (or `npm start`)
5. Add all your backend Environment Variables (`MONGODB_URI`, `CLIENT_URL`, etc.).
6. Deploy!
