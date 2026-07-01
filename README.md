# Expense & Budget Manager

A full-stack expense and budget tracking app with a React frontend, Express backend, and MySQL database. Clean, light-themed UI — login/signup, transaction tracking, monthly budgets, and a monthly report with charts.

## Project structure

```
expense-manager/
├── backend/          Express API (Node.js + MySQL)
│   ├── config/        DB connection
│   ├── middleware/     JWT auth middleware
│   ├── routes/         auth, transactions, budgets, categories, reports
│   ├── schema.sql       Database schema — run this first
│   ├── server.js
│   └── .env.example     Copy to .env and fill in your values
└── frontend/          React app
    ├── public/
    └── src/
        ├── components/  Layout, modals, shared UI
        ├── context/      Auth context
        ├── pages/        Login, Signup, Dashboard, Transactions, Budgets, Report
        └── utils/        Axios API client
```

## 1. Set up the database

Make sure MySQL is installed and running, then:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `expense_manager` database with `users`, `categories`, `transactions`, and `budgets` tables.

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials and a JWT secret:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_manager
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
npm run dev    # with nodemon, auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5000`.

## 3. Set up the frontend

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000` and proxies API calls to `http://localhost:5000` (configured via the `proxy` field in `package.json`).

## How it works

- **Sign up** creates a user with hashed password (bcrypt) and seeds default categories (Food, Transport, Shopping, Housing, Health, Salary, etc).
- **Login** returns a JWT, stored in `localStorage`, attached to every API request.
- **Transactions** — add/edit/delete income or expenses, each tied to a category and date. Filterable by type and category.
- **Budgets** — set a monthly spending limit overall or per category. Progress bars show spent vs. budgeted, with an "over budget" warning.
- **Monthly Report** — pulls together total income/expenses, a category breakdown pie chart, a 6-month income vs. expense trend bar chart, and budget-vs-actual comparisons, navigable by month.

## Notes

- Passwords are hashed with bcrypt; never stored in plaintext.
- All transaction/budget/category endpoints are scoped to the logged-in user via the JWT.
- The UI uses a light theme with a single indigo accent color, Inter typeface, and minimal flourishes — built to feel calm and easy to scan, not flashy.
