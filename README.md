# WebProgramming---Restaurant-Ordering-System
# Georgian Restaurant – Full-Stack Ordering System

A full-stack web application for a traditional Georgian restaurant. Customers can browse the menu, add items to their cart, and place orders. Staff can manage incoming orders, while administrators can manage menu items, categories, orders, and users.

The project was developed to practice full-stack development, database management, API integration, and user authentication.

## Design
- **Figma:** 

## Tech Stack
- **Frontend:** React (Vite), React Router, Context API, CSS
- **Backend:** Node.js, Express.js (REST API)
- **Database:** SQLite (`better-sqlite3`)
- **Authentication:** JWT and bcrypt
- **User Roles:** Customer, Staff, Admin
- **Languages:** English and Georgian

## Getting Started

1. Clone the repository:
   git clone https://github.com/Lizikkk/WebProgramming---Restaurant-Ordering-System.git
   
2. Install backend dependencies
    cd server
    npm install

3. Configure environment variables
    Create a .env file in the server directory using .env.example:

4. Initialize the database and test accounts inside the server directory
    node seed.js

5. Start the backend
    npm run dev

6. Start the frontend
    Open a second terminal:
    cd client
    npm install
    npm run dev

    
Test Logins (Per Role)

Running node seed.js inside the server directory creates one test account for each role.

Admin:Manage menu items, categories, orders, dish availability, and user roles. Access the kitchen board.

Staff: View kitchen orders and update their status (New → Preparing → Ready → Delivered).

Customer: Browse and search the menu, manage cart, place orders, and track order status.

