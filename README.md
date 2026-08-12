# Shree Satwara Maha Mandal — Satvara Samaj Website & Hostel Admission Management System

A production-ready, full-stack web application built for **Shree Satwara Maha Mandal**, an educational community trust managing student hostels in Ahmedabad.

Featuring a flagship **Dynamic Floor → Room → Bed Occupancy Engine**, bilingual Gujarati & English public portal, multi-step online hostel admission wizard with mobile OTP verification, application tracker, public merit list engine, and a role-based administrative control panel.

---

## Tech Stack

- **Frontend:** React.js (Vite), React Router v6, Axios, Context API (Bilingual & Auth state), Lucide Icons, Custom CSS Design System (Deep Maroon & Navy palette, responsive, glassmorphism, micro-animations).
- **Backend:** Node.js, Express.js, REST API, JWT Authentication, Multer (Secure document uploads outside public root), bcryptjs, express-validator, Helmet security headers, CORS, Express Rate Limit.
- **Database:** MySQL database **`satvarabackend`**, Prisma ORM schema migrations & relational seeder.

---

## Quick Start Guide

### Prerequisites
1. **Node.js** (v18+) & **npm** installed.
2. **MySQL Server** (e.g., via XAMPP, phpMyAdmin, or standalone MySQL on `localhost:3306`).
3. Ensure MySQL has the database **`satvarabackend`** created.

---

### Step 1: Database Setup & Seeding

```bash
# Navigate to backend directory
cd backend

# Configure environment variables (Default configured for localhost MySQL satvarabackend)
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Push Database Schema to `satvarabackend`
npx prisma db push

# Run Database Seeder (Seeds default Admin, Hostels, Buildings, Floors, Rooms, Beds, News, Committee, Static Pages)
npm run prisma:seed
```

---

### Step 2: Start Backend Server

```bash
# In backend directory
npm run dev
# Backend API will start on http://localhost:5000
```

---

### Step 3: Start Frontend Dev Server

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies & run Vite dev server
npm run dev
# Public & Admin Portal will start on http://localhost:5173
```

---

## Default Credentials

### Admin Control Panel (`http://localhost:5173/admin/login`)
- **Email:** `admin@satvara.org`
- **Password:** `Admin@123`
- **Role:** Super Administrator

---

## Key Features Built

### 1. 🛏️ Dynamic Hostel → Building → Floor → Room → Bed Occupancy Engine
- Dynamic structure hierarchy (`Hostel → Building → Floor → Room → Bed`).
- Add floors or rooms dynamically with auto-generated Bed records (e.g., set beds = 4 → creates Bed A, B, C, D).
- Interactive visual grid view showing color-coded beds:
  - 🟢 **Vacant**
  - 🔴 **Occupied**
  - 🟡 **Reserved**
  - ⚪ **Under Maintenance**
- Bed side-panel modal:
  - View assigned student details (photo, name, mobile, app no, course) & **Vacate Bed** button.
  - Assign unallocated students to specific vacant beds.
- Search **"Where is student X?"** location finder.
- Real-time live vacant bed counts reflected on public website.

### 2. 📝 Public Bilingual Admission Portal
- Gujarati & English language toggle (`LanguageContext`).
- 7-Step Hostel Application Form wizard.
- Client-side document uploader & mobile OTP verification modal.
- Local draft preservation (form state survives accidental refresh).
- "Track My Application" by Application Number + Mobile Number (no password needed).
- Public published merit lists view.

### 3. 🛡️ Administrative Control Panel
- Role-based access control (Super Admin, Hostel Manager, Admission Manager, Accounts Manager, Content Manager, Warden, Viewer).
- Application Review & Inline Document Verification (Verify / Reject with reason).
- Merit List Engine (auto-ranks applicants based on exam percentages).
- Offline Fee Receipts logger & receipt generator.
- CMS for News announcements, Darpan publication PDFs, photo gallery, downloads, committee trustees.
- Audit trail logging every administrative operation.
