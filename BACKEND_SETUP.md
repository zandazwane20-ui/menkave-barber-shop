# Menkave Barber Shop - Backend Setup Guide

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- MongoDB (local or cloud) - [Download Local](https://www.mongodb.com/try/download/community) or [Cloud Atlas](https://www.mongodb.com/cloud/atlas)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
cd PROJECT.HTML
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `nodemon` - Auto-restart on file changes (dev only)

### Step 2: Setup MongoDB

#### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download and install MongoDB Community Server
2. MongoDB will run as a service on `mongodb://localhost:27017`

**Mac/Linux:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/menkave-barber`

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/menkave-barber
NODE_ENV=development
CORS_ORIGIN=http://localhost:5000
```

For MongoDB Atlas, replace `MONGODB_URI` with your connection string and replace `<db_password>` locally with the database user's password:

```bash
MONGODB_URI=mongodb+srv://zandazwane20_db_user:<db_password>@cluster0.szrkjc7.mongodb.net/menkave-barber
```

### Step 3.5: Setup Email Notifications

The system sends real-time booking alerts to your email. Configure email settings:

#### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/security)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Name: "Menkave Barber Shop"
   - Copy the 16-character password

3. Update `.env`:
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=your-admin-email@gmail.com
EMAIL_FROM_NAME=Menkave Barber Shop
```

#### SendGrid Setup (Alternative)
- Sign up at [sendgrid.com](https://sendgrid.com)
- Generate API key with full access
- Update `.env`:
```bash
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Step 4: Start the Backend Server

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server should run on `http://localhost:5000`

Test health: `http://localhost:5000/api/health`

### Step 5: Start the Full Site

The Express server serves both the frontend and backend. The frontend uses the same-origin API path `/api`, so no separate frontend server or API URL change is required.

Open the site at `http://localhost:5000/` after starting the server.

## API Endpoints

### Get All Bookings
```
GET /api/bookings
Response: Array of all bookings
```

### Get Available Slots for a Date
```
GET /api/bookings/slots/:date
Example: /api/bookings/slots/2026-04-20
Response: { date, bookedSlots: [], totalBooked: 0 }
```

### Check Slot Availability
```
POST /api/bookings/check-availability
Body: { date: "2026-04-20", time: "10:00 AM" }
Response: { date, time, isAvailable: true/false, message: "..." }
```

### Create a Booking
```
POST /api/bookings
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+27123456789",
  services: [
    { service: "Chiskop", price: 50 },
    { service: "Plain cut/Fade", price: 100 }
  ],
  date: "2026-04-20",
  time: "10:00 AM",
  totalPrice: 150
}
Response: { message: "Booking confirmed successfully", booking: {...} }
Triggers: Admin notification email + Customer confirmation email
```

### Get Booking by ID
```
GET /api/bookings/:id
Response: Booking details
```

### Cancel a Booking
```
PATCH /api/bookings/:id/cancel
Response: { message: "Booking cancelled successfully", booking: {...} }
```

## Database Schema

### Booking Document
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  services: [
    { service: String, price: Number }
  ],
  date: String,          // Format: YYYY-MM-DD
  time: String,          // Format: 9:00 AM - 5:00 PM
  totalPrice: Number,
  paymentStatus: String, // pending, completed, failed
  bookingStatus: String, // confirmed, completed, cancelled
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Deploying to Heroku

1. Install Heroku CLI
2. ```bash
   heroku login
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your-atlas-connection-string"
   ```
4. ```bash
   git push heroku main
   ```

### Using MongoDB Atlas for Cloud Database

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `.env` with your connection string
4. Deploy backend to your hosting

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible at the specified URI

**CORS Error:**
- Make sure `CORS_ORIGIN` matches your frontend URL
- Update in `.env` if needed

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

## Next Steps

1. Update your frontend `app.js` to use the API endpoints
2. Test all booking endpoints with Postman or similar tool
3. Deploy backend when ready for production
4. Update `CORS_ORIGIN` and `MONGODB_URI` for production

