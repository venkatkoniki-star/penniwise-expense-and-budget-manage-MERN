# Expense & Budget Manager

A full-stack expense and budget tracking app with a React frontend, Express backend, and MongoDB database. Clean, intuitive UI with Rupee (₹) currency support — login/signup, transaction tracking, monthly budgets, and a monthly report with charts.

## Project structure

```
expense-manager/
├── backend/          Express API (Node.js + MongoDB / Mongoose)
│   ├── config/        MongoDB connection (db.js)
│   ├── middleware/    JWT auth middleware
│   ├── models/        Mongoose schemas (User, Category, Transaction, Budget)
│   ├── routes/        auth, transactions, budgets, categories, reports
│   ├── server.js
│   └── .env.example   Copy to .env and fill in your values
└── frontend/         React app
    ├── public/
    └── src/
        ├── components/  Layout, modals, shared UI
        ├── pages/       Login, Signup, Dashboard, Transactions, Budgets, Report
        └── utils/       Axios API client, formatCurrency helper
```

## 1. Set up MongoDB

Make sure MongoDB is installed and running locally on port 27017 (or use MongoDB Atlas):

```bash
# Verify MongoDB service status or run:
mongod
```

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB connection string and JWT secret:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_manager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
npm run dev    # with nodemon, auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5000`.

## 3. Set up the frontend (Vite React)

```bash
cd frontend
npm install
npm run dev    # lightning-fast Vite dev server
# or npm start
```

The app runs at `http://localhost:3000` with instant HMR and API proxying to `http://localhost:5000`.

## How it works

- **Sign up** creates a user with hashed password (bcrypt) and default currency set to Indian Rupees (`INR`), and seeds default categories (Food & Dining, Transport, Shopping, Housing, Health, Salary, etc).
- **Login** returns a JWT, stored in `localStorage`, attached to every API request.
- **Transactions** — add/edit/delete income or expenses with Rupee (₹) amounts, each tied to a category and date. Filterable by type and category.
- **Budgets** — set a monthly spending limit in Rupees overall or per category. Progress bars show spent vs. budgeted, with an "over budget" warning.
- **Monthly Report** — pulls together total income/expenses in Rupees, a category breakdown pie chart, a 6-month income vs. expense trend bar chart, and budget-vs-actual comparisons, navigable by month.

## Notes

- Passwords are hashed with bcrypt; never stored in plaintext.
- All transaction/budget/category endpoints are scoped to the logged-in user via the JWT.
- All amounts are formatted in Indian Rupees (₹) with standard Indian numbering (`en-IN`).
