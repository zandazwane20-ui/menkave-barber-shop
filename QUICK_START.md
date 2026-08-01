# 🚀 Quick Start Guide - Menkave Barber Shop Backend

## What's Been Set Up

✅ **Node.js/Express Backend Server** - RESTful API for managing bookings
✅ **MongoDB Database** - Persistent storage for all reservations
✅ **Slot Management** - Automatic slot reservation with race condition prevention
✅ **Email Notifications** - Real-time booking alerts to admin + customer confirmations
✅ **Frontend Integration** - Updated app.js to use backend API

## Installation & Running (5 Minutes)

### 1. **Install Node.js**
   - Download from https://nodejs.org/
   - Verify: `node --version` and `npm --version`

### 2. **Install MongoDB**

**Option A: Local MongoDB (Recommended)**
   - Download: https://www.mongodb.com/try/download/community
   - Install and MongoDB will auto-run as a service
   - Default URL: `mongodb://localhost:27017/menkave-barber`

**Option B: MongoDB Atlas (Cloud)**
   - Create free account: https://www.mongodb.com/cloud/atlas
   - Create a cluster and get connection string
   - Update `.env` with your connection string

### 3. **Setup Email Notifications**

**For Gmail (Recommended):**
1. Go to [Google Account Settings](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Generate an "App Password":
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Name it "Menkave Barber Shop"
   - Copy the 16-character password

**Update `.env` file:**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=your-admin-email@gmail.com
EMAIL_FROM_NAME=Menkave Barber Shop
```

**Alternative: Use SendGrid or other email service**
- Sign up at [SendGrid](https://sendgrid.com)
- Get API key and update `.env` accordingly

**Expected Output:**
```
✓ MongoDB connected
✓ Email service ready
Server running on http://localhost:5000
```

### 4. **Test Backend**

Open in browser: `http://localhost:5000/api/health`

Should see: `{ "status": "Backend server is running" }`

### 5. **Test Email Notifications**

**Test email functionality:**
```bash
npm run test-email
```

**Or create a test booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "+27123456789",
    "services": [{"service": "Chiskop", "price": 50}],
    "date": "2026-04-20",
    "time": "10:00 AM",
    "totalPrice": 50
  }'
```

**Expected Results:**
- ✅ Booking created in database
- 📧 **Admin notification email** sent to `ADMIN_EMAIL`
- 📧 **Customer confirmation email** sent to customer's email
- Console shows: `✓ Booking notification sent:` and `✓ Booking confirmation sent to customer:`

## Testing the Booking System

### Using Postman or cURL

**1. Check Slot Availability:**
```bash
curl -X POST http://localhost:5000/api/bookings/check-availability \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-20", "time": "10:00 AM"}'
```

**2. Create a Booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+27123456789",
    "services": [{"service": "Chiskop", "price": 50}],
    "date": "2026-04-20",
    "time": "10:00 AM",
    "totalPrice": 50
  }'
```

**3. Get Available Slots for a Date:**
```bash
curl http://localhost:5000/api/bookings/slots/2026-04-20
```

## How Slot Reservation Works

1. **User selects date** → Frontend fetches booked slots from backend
2. **Time dropdown updates** → Shows only available slots
3. **User completes booking** → Backend checks availability again (prevents race conditions)
4. **Booking confirmed** → Slot saved to MongoDB database
5. **Email notifications sent** → Admin gets instant alert + customer gets confirmation
6. **Other users see updated slots** → Real-time availability

## File Structure

```
PROJECT.HTML/
├── server.js                    # Main backend server
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── .env                         # Your config (create from .env.example)
├── BACKEND_SETUP.md            # Detailed setup guide
├── QUICK_START.md              # This file
├── models/
│   └── Booking.js              # MongoDB schema
├── routes/
│   └── bookings.js             # API endpoints
├── index.html                  # Frontend
├── app.js                      # Frontend logic (UPDATED for backend)
├── styles.css                  # Styles
└── node_modules/               # Dependencies (auto-created)
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `MongooseError: cannot find MongoDB` | Start MongoDB service or check connection string in .env |
| `Port 5000 already in use` | Change PORT in .env to 5001, 5002, etc. |
| `CORS error in browser` | Update `CORS_ORIGIN` in .env to match your frontend URL |
| `API returning 404` | Ensure backend is running with `npm run dev` |
| `Cannot POST /api/bookings` | Check backend is running and MongoDB is connected |

## Frontend Integration Complete ✅

Your `app.js` has been updated to:
- ✅ Fetch available slots from backend on date selection
- ✅ Check slot availability before booking
- ✅ Submit bookings to backend (no more local storage)
- ✅ Display booking confirmation with reservation ID
- ✅ Update slot availability in real-time

**No frontend changes needed!** Just start the backend and it works.

## Next Steps

### Development:
1. Run backend: `npm run dev`
2. Open index.html in browser
3. Test booking a slot
4. Refresh page - slot stays reserved ✅
5. Try booking again - slot not available ✅

### Production Deployment:
1. Use MongoDB Atlas for database
2. Deploy backend to Heroku, AWS, or your server
3. Update `API_BASE_URL` in app.js with production URL
4. Update `CORS_ORIGIN` and `MONGODB_URI` in `.env`
5. Run `npm start`

See **BACKEND_SETUP.md** for detailed deployment instructions.

## Support

For issues, check:
- Logs in the terminal running the backend
- Browser console (F12) for frontend errors
- MongoDB Atlas dashboard for database status
- BACKEND_SETUP.md for detailed documentation

Happy booking! 🎉
