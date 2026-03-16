# 🔍 LostFound App

A full-stack Lost & Found application built with **React + Node.js + MongoDB**.

## 👥 Team Project — 2 Month Timeline

---

## 📁 Project Structure

```
lost-and-found/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── api/            # Axios API calls
│       ├── components/     # Reusable UI components
│       │   ├── auth/       # Login, Register forms
│       │   ├── common/     # Button, Input, Card, etc.
│       │   ├── items/      # ItemCard, ItemForm, ItemList
│       │   ├── messages/   # Chat, MessageBubble
│       │   └── layout/     # Navbar, Footer
│       ├── context/        # AuthContext (global state)
│       ├── hooks/          # useItems, useAuth, etc.
│       ├── pages/          # Route-level pages
│       └── utils/          # Helpers & constants
│
└── server/                 # Node.js + Express backend
    ├── config/             # DB & Cloudinary config
    ├── controllers/        # Route logic
    ├── middleware/         # Auth guard, file upload
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    └── uploads/            # Local image storage
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/lost-and-found.git
cd lost-and-found
```

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret in .env
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
cp .env.example .env.local
npm start
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| POST   | /api/auth/register  | Register user     | ❌   |
| POST   | /api/auth/login     | Login             | ❌   |
| GET    | /api/auth/me        | Get current user  | ✅   |

### Items
| Method | Endpoint            | Description         | Auth |
|--------|---------------------|---------------------|------|
| GET    | /api/items          | Browse items        | ❌   |
| GET    | /api/items/:id      | Get single item     | ❌   |
| GET    | /api/items/my-items | Get my posts        | ✅   |
| POST   | /api/items          | Create item         | ✅   |
| PUT    | /api/items/:id      | Update item         | ✅   |
| DELETE | /api/items/:id      | Delete item         | ✅   |

### Messages
| Method | Endpoint                    | Description           | Auth |
|--------|-----------------------------|-----------------------|------|
| POST   | /api/messages               | Send message          | ✅   |
| GET    | /api/messages/inbox         | Get inbox             | ✅   |
| GET    | /api/messages/:userId/:itemId | Get conversation    | ✅   |

### Users
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| GET    | /api/users/profile  | Get profile       | ✅   |
| PUT    | /api/users/profile  | Update profile    | ✅   |

---

## 🛠 Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18, React Router v6     |
| State    | Context API + useState        |
| Forms    | React Hook Form               |
| Backend  | Node.js + Express             |
| Database | MongoDB + Mongoose            |
| Auth     | JWT + bcryptjs                |
| Realtime | Socket.io                     |
| Images   | Multer (local) / Cloudinary   |
| Styling  | CSS (plain, no framework)     |

---

## 📅 Sprint Plan

### Month 1 — Core
- Week 1: Auth (register/login/JWT) + DB setup
- Week 2: Item CRUD + image upload
- Week 3: Browse, search & filter
- Week 4: Messaging + item status

### Month 2 — Polish
- Week 5: Map view + location filter
- Week 6: Smart matching + notifications
- Week 7: Admin panel + claim flow
- Week 8: Testing, bug fixes, deployment

---

## 👨‍💻 Team Responsibilities

| Member | Responsibility                          |
|--------|-----------------------------------------|
| Dev 1  | Backend: Auth, Models, API routes       |
| Dev 2  | Frontend: UI, pages, components         |
| Dev 3  | Features: Matching, Messages, Map, Admin|

---

## 🔧 Environment Variables

See `server/.env.example` and `client/.env.example` for required variables.
