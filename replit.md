# CTF Platform - Attack on Hash Function

## Overview

This is a Capture The Flag (CTF) platform built with React, Express.js, and Node.js. The application provides a competitive cybersecurity learning environment where users can solve challenges, track their progress, and compete on a leaderboard. The platform features a hacker-themed terminal aesthetic with a dark green color scheme reminiscent of classic terminal interfaces.

## System Architecture

The application follows a modern full-stack architecture:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom terminal-themed variables
- **Animations**: Framer Motion for smooth transitions and effects
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Session Management**: In-memory session storage (simple implementation)
- **Authentication**: Custom JWT-like session tokens with bcryptjs for password hashing
- **API**: RESTful API endpoints with proper error handling

### Data Storage
- **Primary Database**: Drizzle ORM configured for PostgreSQL
- **Alternative Storage**: MongoDB support implemented via custom storage interface
- **Schema**: Relational database design with users, challenges, and submissions tables
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- User registration and login with email verification support
- Session-based authentication with Bearer token support
- Role-based access control (admin/user roles)
- Password hashing with bcryptjs

### Challenge Management
- CRUD operations for CTF challenges
- Support for multiple difficulty levels (EASY, MEDIUM, HARD)
- Challenge categories: WEB, CRYPTO, REVERSE, PWNING, FORENSICS, NETWORK, MISC
- File attachments and external challenge site links
- Flag submission and validation system

### User Progress Tracking
- Individual user progress dashboards
- Submission history and success rates
- Category-wise progress tracking
- Real-time score updates

### Leaderboard System
- Live leaderboard with score rankings
- Visual bar chart representation of top performers
- User profile pages with detailed statistics

### Admin Panel
- Challenge creation and management interface
- User management capabilities
- Platform statistics and monitoring

## Data Flow

1. **User Registration/Login**: Users authenticate through the `/api/auth` endpoints
2. **Challenge Discovery**: Users browse challenges through the `/api/challenges` endpoint
3. **Flag Submission**: Users submit flags via `/api/challenges/:id/submit`
4. **Score Updates**: Successful submissions trigger score updates and leaderboard refresh
5. **Progress Tracking**: User statistics are calculated and cached for performance

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database adapter for PostgreSQL
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **bcryptjs**: Password hashing and verification
- **framer-motion**: Animation library
- **chart.js**: Data visualization for leaderboards

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for server development
- **esbuild**: Fast JavaScript bundler for production builds
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 on Replit
- **Development Server**: Runs on port 5000 with hot reload
- **Database**: Configurable between PostgreSQL (primary) and MongoDB (alternative)

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Replit autoscale deployment with proper environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `MONGODB_URI`: MongoDB connection string (optional)
- `NODE_ENV`: Environment flag for development/production modes

### Database Setup
The application includes comprehensive setup guides for both PostgreSQL (via Neon) and MongoDB Atlas, ensuring flexible deployment options based on infrastructure preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 14, 2025. Initial setup