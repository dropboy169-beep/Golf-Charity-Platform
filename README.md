# Golf Charity Platform ⛳️

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet.svg)](https://stripe.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald.svg)](https://supabase.com/)

A premium, full-stack subscription-based charity platform designed for a high-end golf community. Built with a focus on high-fidelity UI/UX, secure financial integrations, and automated draw logic.

---

## 🌟 Key Features

### 💎 Premium UI/UX
- **Glassmorphism Design:** Modern, sleek interface with blur effects and neon accents.
- **Fluid Animations:** Powered by **Framer Motion** for a seamless, "alive" feel.
- **Dark Mode First:** Optimized for eye comfort and a high-end SaaS aesthetic.

### 🎟️ Intelligent Draw System 
- **PRD-Compliant Logic:** Enforced automated draw logic to ensure fairness and compliance.
- **Subscription-based Entries:** Users are automatically entered into draws based on their subscription tier (Monthly/Yearly).
- **Admin Dashboard:** Full control over charities, winners, and draw schedules.

### 💳 Robust Financials
- **Stripe Integration:** Secure subscription management and one-time payments.
- **Automated Billing:** Professional handling of monthly and yearly recurring cycles.

### 🚀 Technical Excellence
- **Real-time Notifications:** Automated email updates via SMTP (Nodemailer).
- **Infinite Scalability:** Hosted on **Supabase** (PostgreSQL) with **Cloudinary** for lightning-fast image delivery.
- **Secure Auth:** Multi-layered security using **JWT** and **Supabase Auth**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express 5, JWT |
| **Database** | Supabase (PostgreSQL) |
| **Payments** | Stripe API |
| **Storage** | Cloudinary (Images/Assets) |
| **Email** | Nodemailer (SMTP Integration) |

---

## 📂 Project Structure

```bash
├── client/          # Vite + React Frontend
│   ├── src/         # Main application logic
│   └── public/      # Static assets
├── server/          # Node.js + Express Backend
│   ├── src/         # API routes, Controllers, Utilities
│   └── tests/       # Unit and Integration tests
└── README.md        # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- Supabase Account
- Stripe Account
- Brevo Account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `server` directory and fill in your credentials.

```bash
cp server/.env.example server/.env
```

### 3. Install Dependencies
```bash
# Install root dependencies (if any)
npm install

# Install Client dependencies
cd client && npm install

# Install Server dependencies
cd ../server && npm install
```

### 4. Run the Application
```bash
# In one terminal (Client)
cd client
npm run dev

# In another terminal (Server)
cd server
npm run dev
```

---

## 🏆 For Recruiters

This project demonstrates my ability to:
- Develop complex, **full-stack CRUD** applications with modern frameworks.
- Integrate **third-party APIs** (Stripe, Cloudinary, Supabase).
- Implement **automated business logic** (draw systems).
- Design and build **premium, responsive UI/UX** using Tailwind CSS and Framer Motion.
- Ensure **secure authentication** and data handling.

---

## 📫 Contact

Feel free to reach out for a project walkthrough!
- **GitHub:** [Kartik-Raut-12](https://github.com/Kartik-Raut-12)
- **LinkedIn:** [Kartik Raut](https://linkedin.com/in/kartik-raut-4a1057270)
- **Email:** [kartikraut169@gmail.com](mailto:kartikraut169@gmail.com)

---
*Developed with ❤️ as a high-fidelity coding assessment.*
