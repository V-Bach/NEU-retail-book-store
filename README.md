# NEU Retail Book Store - Library Management System

A modern full-stack web application designed for a seamless book borrowing experience. This system integrates the Google Books API with a local database to manage inventory, user loans, and return histories.

## Key Features

* **Hybrid Book Sourcing:** Explore books from both the local database and the external Google Books API.
* **Seamless Syncing:** Automatically synchronizes external API books into the local MySQL database upon borrowing to ensure data integrity.
* **Simplified Checkout:** A user-friendly borrowing process with customizable durations (7 or 14 days).
* **Loan Management:** Users can track their active loans, view return deadlines, and return books directly through their profile.
* **Automated Stock Control:** Real-time stock updates (increment/decrement) during borrow and return actions.

## Tech Stack

### Frontend:

* **React.js (Vite)** & **Tailwind CSS** for a responsive and clean UI.
* **Redux Toolkit** for efficient cart and state management.
* **SweetAlert2** for interactive and professional user notifications.

### Backend:

* **Node.js** & **Express** framework.
* **MySQL** with **Sequelize ORM** for relational data management.
* **JWT (JSON Web Token)** for secure user authentication and route protection.
* **Moment.js** for precise date calculations regarding loan deadlines.

## Project Structure

```text
├── client/                # Frontend application
│   ├── src/assets/        # Static assets (images/icons)
│   ├── src/components/    # Reusable UI components (Navbar, BookCard)
│   ├── src/pages/         # Main views (Home, Checkout, Orders)
│   └── src/utils/         # Helper functions (Image handlers, API config)
└── server/                # Backend API
    ├── src/config/        # Database and server configurations
    ├── src/controllers/   # Business logic (Loan and Book handling)
    ├── src/models/        # Database schemas (User, Book, Loan, CartItem)
    └── src/routes/        # API Endpoints

```

## Installation & Setup

1. **Clone the Repository:**
```bash
git clone https://github.com/your-username/neu-bookstore.git

```


2. **Backend Setup:**
```bash
cd server
npm install
# Configure your .env file (PORT, DB_NAME, JWT_SECRET, etc.)
npm start

```


3. **Frontend Setup:**
```bash
cd client
npm install
npm run dev

```



## 📝 Important Notes

* **Authentication:** Many features like borrowing and viewing history require a valid token. Ensure you log in before testing the checkout flow.
* **Image Handling:** The system includes a robust image utility that fallbacks to placeholders if a book cover is missing from the database or API.
