const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendBookingNotification, sendBookingConfirmation } = require('../services/emailService');

// Get all bookings (admin/dashboard - optional)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ date: 1, time: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all booked slots for a specific date
router.get('/slots/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const bookings = await Booking.find({
            date: date,
            bookingStatus: { $ne: 'cancelled' }
        }).select('time');
        
        const bookedSlots = bookings.map(booking => booking.time);
        
        res.json({ 
            date,
            bookedSlots,
            totalBooked: bookedSlots.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if a specific slot is available
router.post('/check-availability', async (req, res) => {
    try {
        const { date, time } = req.body;
        
        if (!date || !time) {
            return res.status(400).json({ error: 'Date and time are required' });
        }
        
        const existingBooking = await Booking.findOne({
            date,
            time,
            bookingStatus: { $ne: 'cancelled' }
        });
        
        const isAvailable = !existingBooking;
        
        res.json({ 
            date,
            time,
            isAvailable,
            message: isAvailable ? 'Slot is available' : 'Slot is already booked'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new booking
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, services, date, time, totalPrice } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !date || !time || !services || services.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, email, phone, date, time, services'
            });
        }
        
        // Check if slot is already booked
        const existingBooking = await Booking.findOne({
            date,
            time,
            bookingStatus: { $ne: 'cancelled' }
        });
        
        if (existingBooking) {
            return res.status(409).json({ 
                error: 'This slot is already booked. Please select a different time.'
            });
        }
        
        // Create new booking
        const booking = new Booking({
            name,
            email,
            phone,
            services,
            date,
            time,
            totalPrice,
            paymentStatus: 'completed',
            bookingStatus: 'confirmed'
        });
        
        await booking.save();
        
        // Send email notifications
        const bookingData = {
            id: booking._id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            services: booking.services,
            date: booking.date,
            time: booking.time,
            totalPrice: booking.totalPrice,
            bookingStatus: booking.bookingStatus
        };

        // Send notification to admin (async, don't wait)
        sendBookingNotification(bookingData).catch(err =>
            console.error('Admin notification failed:', err)
        );

        // Send confirmation to customer (async, don't wait)
        sendBookingConfirmation(bookingData).catch(err =>
            console.error('Customer confirmation failed:', err)
        );
        
        res.status(201).json({
            message: 'Booking confirmed successfully',
            booking: {
                id: booking._id,
                name: booking.name,
                date: booking.date,
                time: booking.time,
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                createdAt: booking.createdAt,
                emailSent: true
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { bookingStatus: 'cancelled' },
            { new: true }
        );
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({ 
            message: 'Booking cancelled successfully',
            booking 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
