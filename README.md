# 🛍️ E-Commerce Product Recommender with LLM-Powered Explanations

> **Academic Project**: Intelligent product recommendation system using hybrid algorithms and AI-generated explanations powered by OpenAI GPT-4o-mini.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [API Documentation](#-api-documentation)
- [Admin Testing Panel](#-admin-testing-panel)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

This project implements an intelligent e-commerce recommendation system that:
- Tracks **all user behaviors** (views, cart actions, purchases, searches)
- Uses a **hybrid recommendation algorithm** (trending + rule-based + collaborative filtering)
- Generates **AI-powered explanations** using OpenAI GPT-4o-mini for why products are recommended
- Supports **guest users** with 30-day session retention
- Provides an **admin testing panel** for simulation and demonstration

---

## ✨ Features

### 🔐 Authentication
- Custom JWT-based authentication with bcrypt password hashing
- Cookie-based sessions (7-day expiry)
- Login/Signup pages with form validation
- Protected routes and API endpoints

### 🤖 Recommendation Engine
- **Cold Start (0-2 views)**: Trending products based on ratings
- **Warm Start (3-9 views)**: Rule-based recommendations (same category, similar price)
- **Hot Start (10+ views)**: Hybrid collaborative filtering + rule-based
- **1-hour caching** per user for performance

### 🧠 AI-Powered Explanations
- **OpenAI GPT-4o-mini** generates personalized 2-3 sentence explanations
- Context includes: user's category preference, budget, browsing history, search queries
- **Cost optimized**: Only for logged-in users, top 3 recommendations only
- Graceful error handling with fallback messages

### 📊 Behavior Tracking
- **All actions tracked**: VIEW, ADD_TO_CART, REMOVE_FROM_CART, PURCHASE, SEARCH, TIME_SPENT
- **Guest support**: Session-based tracking with 30-day retention
- **Metadata support**: Additional context (search queries, time spent, etc.)

### 🔬 Admin Testing Panel
- Simulate user behaviors in real-time
- Auto-creates test users if they don't exist
- Bypasses cold-start limitations for demonstrations
- View AI explanations for recommended products
- Perfect for academic presentations and testing

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (UI components)
- **Lucide React** (Icons)

### Backend
- **Next.js API Routes** (Serverless)
- **Prisma ORM** (Database queries)
- **Neon PostgreSQL** (Database)
- **OpenAI API** (GPT-4o-mini)

### Authentication
- **jose** (JWT tokens)
- **bcryptjs** (Password hashing)

### External APIs
- **Fake Store API** (Product data)
- **OpenAI** (LLM explanations)
- **Resend** (Email notifications - optional)

---

## ✅ Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL Database** (Neon recommended)
- **OpenAI API Key** (for LLM explanations)
- **Git** (version control)

---

## 📥 Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Unthinkible
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

> **Note**: `--legacy-peer-deps` is required due to React 19 RC compatibility.

---

## 🔧 Environment Setup

### Create `.env` File

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Authentication
SESSION_SECRET="your-super-secret-key-min-32-characters-long"

# OpenAI API (Required for LLM explanations)
OPENAI_API_KEY="sk-proj-..."

# Email (Optional - Resend)
RESEND_API_KEY="re_..."
```

### Get Your API Keys

1. **Database (Neon PostgreSQL)**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string to `DATABASE_URL`

2. **OpenAI API**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Generate API key
   - Copy to `OPENAI_API_KEY`

3. **Session Secret**:
   - Generate a random string (32+ characters)
   - Example: `openssl rand -base64 32` (Linux/Mac) or use online generator

---

## 🗄️ Database Setup

### 1. Push Prisma Schema
```bash
npx prisma db push
```

This creates all tables in your database.

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Seed Database with Products
```bash
npx ts-node prisma/seed.ts
```

This fetches 20 products from Fake Store API and seeds your database.

### 4. Verify Database (Optional)
```bash
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555` to view your data.

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Server runs at: **http://localhost:3000**

### Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
Unthinkible/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   ├── signup/route.ts   # POST /api/auth/signup
│   │   │   ├── logout/route.ts   # POST /api/auth/logout
│   │   │   └── me/route.ts       # GET /api/auth/me
│   │   ├── products/             # Product endpoints
│   │   │   ├── route.ts          # GET /api/products
│   │   │   └── [id]/route.ts     # GET /api/products/:id
│   │   ├── recommendations/      # Recommendation engine
│   │   │   └── route.ts          # GET /api/recommendations
│   │   ├── behavior/             # Behavior tracking
│   │   │   └── track/route.ts    # POST /api/behavior/track
│   │   └── admin/                # Admin panel
│   │       └── test/recommend/route.ts  # POST /api/admin/test/recommend
│   ├── auth/                     # Auth pages
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   ├── products/                 # Product pages
│   │   ├── page.tsx              # Product listing
│   │   └── [id]/page.tsx         # Product detail
│   ├── dashboard/page.tsx        # User dashboard with recommendations
│   ├── admin/test/page.tsx       # Admin testing panel
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── Navbar.tsx                # Navigation with auth state
│   ├── ProductCard.tsx           # Product display card
│   └── RecommendationCard.tsx    # Recommendation with explanation
├── lib/                          # Utility libraries
│   ├── auth.ts                   # JWT authentication utilities
│   ├── llm.ts                    # OpenAI LLM service
│   ├── recommender.ts            # Recommendation algorithms
│   ├── email.ts                  # Email service (Resend)
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script (Fake Store API)
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🔬 How It Works

### 1. User Authentication Flow

```
1. User visits /auth/signup
2. Enters email, password, name
3. POST /api/auth/signup
   - Hash password with bcrypt (10 rounds)
   - Create user in database
   - Generate JWT token (7-day expiry)
   - Set HttpOnly cookie
4. Redirect to /dashboard
```

### 2. Behavior Tracking Flow

```
1. User views product at /products/1
2. Client-side: trackView(productId)
3. POST /api/behavior/track
   {
     "productId": 1,
     "action": "view",
     "sessionId": "guest_12345" or userId
   }
4. Normalize action to uppercase (VIEW, ADD_TO_CART, etc.)
5. Create UserBehavior record
6. Set 30-day expiry for data retention
```

### 3. Recommendation Generation Flow

```
1. User visits /dashboard
2. GET /api/recommendations?limit=6
3. Get current user (from JWT cookie)
4. Check cache (1-hour expiry)
5. If no cache:
   a. Analyze user behavior:
      - Total views, top category, avg price, searches
   b. Apply hybrid algorithm:
      - Cold start (< 3 views): Trending products
      - Warm start (3-9 views): Rule-based (same category, similar price)
      - Hot start (10+ views): Collaborative filtering + rule-based
   c. Fetch product details
   d. Generate AI explanations (top 3, logged-in users only):
      - Build context: user behavior + product details
      - Call OpenAI GPT-4o-mini
      - Get 2-3 sentence explanation
   e. Cache results
6. Return recommendations with explanations
```

### 4. AI Explanation Generation

**Prompt Template:**
```
You are a friendly personal shopping assistant. Explain why this product is recommended.

Product Details:
- Name: Mens Cotton Jacket
- Category: men's clothing
- Price: $55.99
- Rating: 4.7/5

User Profile:
preference for men's clothing, typical budget around $50, 8 products viewed, recent searches: "jacket", "cotton"

Write a personalized 2-3 sentence explanation of why this product matches their interests.
```

**AI Response Example:**
> "Hey there! Based on your preference for men's clothing and your typical budget around $50, the Men's Cotton Jacket at $55.99 is a fantastic fit for you. With a stellar rating of 4.7/5, it promises both style and quality, making it a great addition to your wardrobe without breaking the bank. Plus, it matches your recent searches for jackets perfectly!"

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### `POST /api/auth/login`
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### `POST /api/auth/logout`
Logout current user.

**Response:**
```json
{
  "success": true
}
```

#### `GET /api/auth/me`
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Product Endpoints

#### `GET /api/products`
Get all products.

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "title": "Fjallraven Foldsack No. 1 Backpack",
      "price": 109.95,
      "category": "men's clothing",
      "image": "https://...",
      "ratingRate": 3.9,
      "ratingCount": 120
    }
  ],
  "count": 20
}
```

#### `GET /api/products/:id`
Get single product by ID.

**Response:**
```json
{
  "product": {
    "id": 1,
    "title": "Fjallraven Foldsack No. 1 Backpack",
    "price": 109.95,
    "description": "Your perfect pack...",
    "category": "men's clothing",
    "image": "https://...",
    "ratingRate": 3.9,
    "ratingCount": 120
  }
}
```

---

### Recommendation Endpoint

#### `GET /api/recommendations`
Get personalized recommendations.

**Query Parameters:**
- `limit` (number, default: 6) - Number of recommendations
- `explanations` (boolean, default: true) - Generate AI explanations
- `cache` (boolean, default: true) - Use cached recommendations

**Response:**
```json
{
  "recommendations": [
    {
      "product": {
        "id": 3,
        "title": "Mens Cotton Jacket",
        "price": 55.99,
        "category": "men's clothing",
        "image": "https://...",
        "ratingRate": 4.7,
        "ratingCount": 500
      },
      "score": 0.95,
      "explanation": "Based on your preference for men's clothing...",
      "algorithm": "rule-based"
    }
  ],
  "cached": false,
  "userId": "clx1234567890",
  "count": 6
}
```

---

### Behavior Tracking Endpoint

#### `POST /api/behavior/track`
Track user behavior.

**Request:**
```json
{
  "productId": 1,
  "action": "view",
  "sessionId": "guest_12345",
  "metadata": {
    "query": "cotton jacket",
    "timeSpent": 45
  }
}
```

**Valid Actions:**
- `view` - User viewed product
- `add_to_cart` - User added to cart
- `remove_from_cart` - User removed from cart
- `purchase` - User purchased product
- `search` - User searched (include query in metadata)
- `time_spent` - User spent time on page

**Response:**
```json
{
  "success": true,
  "behaviorId": 123,
  "userId": "guest"
}
```

---

### Admin Testing Endpoint

#### `POST /api/admin/test/recommend`
Generate test recommendations with simulated behaviors.

**Request:**
```json
{
  "userId": "test-user-1",
  "behaviors": [
    {
      "productId": 9,
      "action": "view",
      "metadata": { "note": "WD Portable HDD" }
    },
    {
      "productId": 11,
      "action": "view"
    },
    {
      "productId": 9,
      "action": "add_to_cart"
    }
  ],
  "limit": 6,
  "generateExplanations": true
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "test-1760715034329",
  "behaviorsCreated": 3,
  "recommendations": [
    {
      "product": { ... },
      "score": 0.95,
      "explanation": "Based on your interest in electronics...",
      "algorithm": "rule-based"
    }
  ],
  "testData": {
    "userId": "test-user-1",
    "behaviors": [ ... ],
    "behaviorSummary": {
      "totalBehaviors": 3,
      "viewCount": 2
    }
  }
}
```

---

## 🔬 Admin Testing Panel

### Access
Navigate to: **http://localhost:3000/admin/test**

### Features
1. **Auto User Creation**: Creates test users if they don't exist
2. **Behavior Simulation**: Test any combination of user actions
3. **No Cold Start Limits**: Bypasses 3-view threshold for testing
4. **AI Explanations**: Shows GPT-4o-mini generated explanations
5. **Real-time Results**: See recommendations instantly

### How to Use

1. **Enter User ID**: 
   - Example: `test-electronics-user`
   - System auto-creates if doesn't exist

2. **Configure Test Behaviors** (JSON):
```json
[
  {
    "productId": 9,
    "action": "view",
    "metadata": { "note": "WD 2TB Portable HDD" }
  },
  {
    "productId": 11,
    "action": "view"
  },
  {
    "productId": 12,
    "action": "view"
  },
  {
    "productId": 9,
    "action": "add_to_cart"
  }
]
```

3. **Set Parameters**:
   - Limit: 6 recommendations
   - Generate Explanations: ✓ Checked

4. **Click "Generate Test Recommendations"**

### Default Test Scenario (Electronics)

**Recommended for demonstrations**:
```json
[
  { "productId": 9, "action": "view" },   // WD 2TB Elements Portable
  { "productId": 11, "action": "view" },  // Silicon Power 256GB SSD
  { "productId": 12, "action": "view" },  // WD 4TB Gaming Drive
  { "productId": 9, "action": "add_to_cart" },
  { "productId": 13, "action": "view" }   // Acer SB220Q Monitor
]
```

**Why Electronics?**
- 6 electronics products in database (IDs 9-14)
- Viewing 4 leaves 2+ for recommendations
- AI explanations are coherent (same category)
- Perfect for demonstrating personalization

### Expected Results
```
✅ Behaviors Created: 5
✅ Recommendations: 6 electronics products
✅ Top 3 with AI Explanations
✅ Coherent category matching
✅ Proper scoring (0.95 to 0.70)
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Prisma Client Out of Sync**
```bash
npx prisma generate
```
Run after any schema changes.

#### 2. **Port Already in Use**
```bash
# Windows PowerShell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Linux/Mac
killall node
```

#### 3. **Database Connection Error**
- Check `DATABASE_URL` in `.env`
- Ensure `?sslmode=require` is appended
- Verify Neon database is active

#### 4. **OpenAI API Error**
- Check `OPENAI_API_KEY` in `.env`
- Verify API key is valid and has credits
- Check rate limits at platform.openai.com

#### 5. **Empty Recommendations**
- Ensure database has products: `npx ts-node prisma/seed.ts`
- Check user has behaviors tracked
- Verify behavior actions are uppercase (VIEW, ADD_TO_CART)

#### 6. **ActionType Validation Error**
```
Invalid value for argument 'action'. Expected ActionType.
```
**Cause**: Frontend sends lowercase ("view"), Prisma expects uppercase ("VIEW")  
**Fix**: Already implemented - API normalizes to uppercase automatically

#### 7. **Next.js 15 Async Params Warning**
```
Route "/api/products/[id]" used `params.id`. `params` should be awaited.
```
**Cause**: Next.js 15 requires await on dynamic params  
**Fix**: Already implemented - all dynamic routes use `await params`

---

## 🎓 Academic Assignment Notes

### Key Features for Presentation

1. **Hybrid Recommendation Algorithm**
   - Cold/Warm/Hot start strategies
   - Collaborative filtering + rule-based
   - Demonstrates understanding of recommendation systems

2. **AI Integration**
   - Real OpenAI GPT-4o-mini integration
   - Context-aware prompt engineering
   - Cost optimization strategies

3. **Full-Stack Implementation**
   - Next.js 15 (latest framework)
   - TypeScript (type safety)
   - PostgreSQL (production database)
   - Custom authentication (security)

4. **Scalability Considerations**
   - API route caching
   - Database indexing
   - Connection pooling
   - Behavior data expiry (30 days)

5. **Testing & Validation**
   - Admin testing panel
   - Behavior simulation
   - Real-time recommendation generation

### Demonstration Flow

1. **Show Product Catalog** (`/products`)
2. **Demonstrate Behavior Tracking** (view product, track action)
3. **Show Guest Recommendations** (`/dashboard` - logged out)
4. **Create Account** (`/auth/signup`)
5. **Show Personalized Recommendations** (`/dashboard` - logged in)
6. **Admin Testing Panel** (`/admin/test`) - simulate and explain
7. **Show AI Explanations** (highlight GPT-4o-mini integration)

---

## 📊 Database Schema

### User
- `id` - Unique identifier (cuid)
- `email` - Email address (unique)
- `password` - Hashed password (bcrypt)
- `name` - Optional name
- `createdAt`, `updatedAt` - Timestamps

### Product
- `id` - Product ID
- `title` - Product name
- `price` - Price
- `description` - Description
- `category` - Category
- `image` - Image URL
- `ratingRate` - Average rating
- `ratingCount` - Number of ratings

### UserBehavior
- `id` - Behavior ID
- `userId` - User ID (nullable for guests)
- `sessionId` - Session ID (for guest tracking)
- `productId` - Product ID
- `action` - ActionType enum (VIEW, ADD_TO_CART, etc.)
- `metadata` - JSON metadata
- `expiresAt` - 30-day retention
- `createdAt` - Timestamp

### Recommendation
- `id` - Recommendation ID
- `userId` - User ID
- `productId` - Product ID
- `score` - Relevance score
- `explanation` - LLM explanation
- `algorithm` - Algorithm used
- `expiresAt` - 1-hour cache
- `createdAt` - Timestamp

### GuestSession
- `id` - Session ID
- `sessionId` - Guest session identifier
- `expiresAt` - 30-day retention
- `createdAt` - Timestamp

---

## 👨‍💻 Development

### Available Scripts

```bash
# Development
npm run dev           # Start dev server

# Production
npm run build         # Build for production
npm start             # Start production server

# Database
npx prisma db push    # Push schema changes
npx prisma generate   # Regenerate Prisma client
npx prisma studio     # Open Prisma Studio
npx ts-node prisma/seed.ts  # Seed database

# Linting
npm run lint          # Run ESLint
```

---

## 🎉 Project Status

**Status**: ✅ FULLY FUNCTIONAL

All features implemented, tested, and ready for demonstration!

**Last Updated**: October 17, 2025

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review API documentation
3. Test with Admin Panel
4. Check browser console for errors
5. Review server logs in terminal

---

**Built with ❤️ using Next.js 15, TypeScript, Prisma, and OpenAI GPT-4o-mini**
