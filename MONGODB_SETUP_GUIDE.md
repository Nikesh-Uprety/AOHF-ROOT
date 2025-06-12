# MongoDB Cloud Setup Guide for CTF Platform

## Step-by-Step MongoDB Cluster Creation

### 1. Create MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create account with email and password
4. Verify your email address

### 2. Create a New Project
1. After login, click "New Project"
2. Name your project (e.g., "CTF-Platform")
3. Click "Next" and "Create Project"

### 3. Build Your First Cluster
1. Click "Build a Database"
2. Choose deployment option:
   - **FREE (M0)** - Perfect for development
   - Select AWS, Google Cloud, or Azure
   - Choose nearest region
3. Click "Create Cluster"

### 4. Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 5. Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click "Confirm"

### 6. Get Connection String
1. Go to "Database" (Deployment)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your database user password

### 7. Database Schema Design

#### Collections Structure:

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  isAdmin: Boolean,
  score: Number,
  challengesSolved: Number,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  createdAt: Date,
  updatedAt: Date
}

// Challenges Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String, // "EASY", "MEDIUM", "HARD"
  points: Number,
  flag: String,
  category: String, // "Web", "Crypto", "Binary", "Forensics", "Network"
  isActive: Boolean,
  downloadUrl: String, // Optional file download
  challengeSiteUrl: String, // Optional external site
  createdAt: Date,
  updatedAt: Date
}

// Submissions Collection
{
  _id: ObjectId,
  userId: ObjectId,
  challengeId: ObjectId,
  flag: String,
  isCorrect: Boolean,
  submittedAt: Date
}

// Email Verification Tokens Collection
{
  _id: ObjectId,
  userId: ObjectId,
  token: String,
  expiresAt: Date,
  createdAt: Date
}
```

### 8. Environment Variables Setup
Add these to your `.env` file:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ctf-platform?retryWrites=true&w=majority
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
JWT_SECRET=your-super-secret-key-here
BASE_URL=http://localhost:5000
```

### 9. Google Gmail API Setup for Email Verification
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Gmail API
4. Create credentials (Service Account or OAuth 2.0)
5. Generate App Password for Gmail:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password
   - Use this password in `GMAIL_APP_PASSWORD`

### 10. Install Required Dependencies
```bash
npm install mongodb nodemailer jsonwebtoken crypto
```

### 11. API Endpoints Implementation

#### Authentication Endpoints:
- `POST /api/auth/register` - Register with email verification
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Challenge Management (Admin):
- `GET /api/admin/challenges` - List all challenges
- `POST /api/admin/challenges` - Create new challenge
- `PUT /api/admin/challenges/:id` - Update challenge
- `DELETE /api/admin/challenges/:id` - Delete challenge
- `POST /api/admin/challenges/:id/toggle` - Activate/deactivate

#### User Progress:
- `GET /api/user/submissions` - Get user's submissions
- `GET /api/user/progress` - Get detailed progress statistics
- `GET /api/user/solved-challenges` - Get list of solved challenges

### 12. Security Considerations
1. **Password Hashing**: Use bcrypt with salt rounds ≥ 12
2. **JWT Tokens**: Short expiry (15-30 minutes) with refresh tokens
3. **Email Verification**: Tokens expire in 24 hours
4. **Rate Limiting**: Implement for login/registration endpoints
5. **Input Validation**: Validate all inputs with Zod schemas
6. **CORS**: Configure properly for production

### 13. Database Indexes
Create these indexes for better performance:

```javascript
// Users collection
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "emailVerificationToken": 1 })

// Challenges collection
db.challenges.createIndex({ "category": 1 })
db.challenges.createIndex({ "difficulty": 1 })
db.challenges.createIndex({ "isActive": 1 })

// Submissions collection
db.submissions.createIndex({ "userId": 1 })
db.submissions.createIndex({ "challengeId": 1 })
db.submissions.createIndex({ "userId": 1, "challengeId": 1 })
db.submissions.createIndex({ "submittedAt": -1 })
```

### 14. Testing the Setup
1. Test database connection
2. Create test user with email verification
3. Test challenge CRUD operations
4. Verify email sending functionality
5. Test progress tracking calculations

This setup provides a robust, scalable foundation for the CTF platform with proper user management, email verification, and comprehensive challenge tracking.