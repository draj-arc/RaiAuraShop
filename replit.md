# Rai Aura - Premium Jewellery E-Commerce Website

## Overview
Rai Aura is a complete e-commerce website for a premium jewellery brand. The site features a sophisticated beige, mocha brown, and rose gold color scheme with a modern, elegant design optimized for all devices.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon-backed via Drizzle ORM)
- **Authentication**: JWT-based login/signup
- **Payment**: Stripe integration
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
└── shared/
    └── schema.ts          # Shared types and schemas
```

## Key Features
1. **Homepage**: Hero banner with tagline, category showcase, new arrivals
2. **Shop Page**: Product grid with category filtering
3. **Product Detail Pages**: Image gallery, pricing, add-to-cart, product info
4. **Shopping Cart**: Slide-out drawer with item management
5. **Checkout**: Stripe payment integration with secure checkout flow
6. **User Dashboard**: Order history and account management
7. **Admin Panel**: Full CRUD operations for products and categories
8. **Additional Pages**: About Us, Contact, FAQ, Policies

## Database Schema
- **users**: User accounts with admin flag
- **categories**: Product categories (Earrings, Rings, Bracelets, Necklaces, Hair Accessories)
- **products**: Product catalog with images, pricing, stock
- **cartItems**: Shopping cart items (localStorage-based on frontend)
- **orders**: Order records with shipping details
- **orderItems**: Line items for each order

## API Endpoints
- `GET /api/products` - List all products
- `GET /api/products/featured` - Featured products
- `GET /api/products/:slug` - Product by slug
- `POST /api/products` - Create product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/create-payment-intent` - Stripe payment intent

## Design System
- **Colors**: Beige (#F5F1EC), Mocha Brown (#5C4033), Rose Gold (#D4A574)
- **Typography**: Cormorant Garamond (headings), Montserrat (body)
- **Components**: Premium Shadcn UI components with custom styling
- **Responsive**: Mobile-first design, fully responsive across all devices

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables (see `.env` template)
3. Push database schema: `npm run db:push`
4. Seed database: `npx tsx server/seed.ts`
5. Start development server: `npm run dev`

## Admin Access
- Email: admin@raiaura.com
- Password: admin123

## Recent Changes (Latest Session)
- Implemented complete database schema with all e-commerce tables
- Created all API endpoints for products, categories, orders, and authentication
- Built complete frontend with all pages and components
- Integrated cart functionality with localStorage
- Implemented admin panel with CRUD operations
- Added Stripe payment integration for checkout
- Seeded database with initial categories and products
