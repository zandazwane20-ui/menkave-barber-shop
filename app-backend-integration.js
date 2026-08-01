// Backend Integration for Frontend
// Add this to your existing app.js or replace the relevant functions

const API_BASE_URL = 'http://localhost:5000/api';

// ===== UPDATED SLOT RESERVATION SYSTEM =====

// Initialize reserved slots from backend on page load
async function initializeReservedSlots() {
    // This will be loaded from backend dynamically
    console.log('Connected to backend API for slot management');
}

// Get booked slots for a date from backend
async function getBookedSlotsForDate(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/slots/${date}`);
        if (!response.ok) throw new Error('Failed to fetch slots');
        
        const data = await response.json();
        return data.bookedSlots || [];
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        return [];
    }
}

// Check if a slot is available
async function checkSlotAvailability(date, time) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time })
        });
        
        if (!response.ok) throw new Error('Failed to check availability');
        
        const data = await response.json();
        return data.isAvailable;
    } catch (error) {
        console.error('Error checking slot availability:', error);
        return false;
    }
}

// Update time slot options based on selected date (BACKEND VERSION)
async function updateTimeSlotOptions() {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const selectedDate = dateInput.value;

    if (!selectedDate || !timeSelect) return;

    // Get booked slots from backend
    const bookedSlots = await getBookedSlotsForDate(selectedDate);

    // All available time slots
    const timeOptions = [
        "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
    ];

    // Clear current options
    timeSelect.innerHTML = '';

    // Add available time options
    timeOptions.forEach(time => {
        if (!bookedSlots.includes(time)) {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        }
    });

    // If all slots are reserved
    if (timeSelect.options.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No available slots for this date';
        option.disabled = true;
        timeSelect.appendChild(option);
    }
}

// ===== UPDATED BOOKING SUBMISSION =====

async function submitBooking(bookingData) {
    try {
        // First check if slot is still available (race condition prevention)
        const isAvailable = await checkSlotAvailability(bookingData.date, bookingData.time);
        
        if (!isAvailable) {
            showMessage('This slot has just been reserved by another customer. Please select a different time.', 'error');
            updateTimeSlotOptions();
            return false;
        }

        // Prepare the booking payload for backend
        const payload = {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            services: cart, // cart items
            date: bookingData.date,
            time: bookingData.time,
            totalPrice: getTotalPrice()
        };

        // Send booking to backend
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Booking failed');
        }

        const result = await response.json();
        
        // Update available slots
        updateTimeSlotOptions();
        
        showMessage(`✓ Booking confirmed! Your reservation ID: ${result.booking.id}`, 'success');
        clearForm();
        
        return true;
    } catch (error) {
        console.error('Booking error:', error);
        showMessage(`Error: ${error.message}`, 'error');
        return false;
    }
}

// Get total price from cart
function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

// ===== INTEGRATE WITH EXISTING BOOKING FORM =====

// Update the booking form submission to use backend API
// Replace the existing bookingForm.addEventListener('submit') with this:

/*
bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const booking = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        cardNumber: formData.get('cardNumber'),
        expiry: formData.get('expiry'),
        cvc: formData.get('cvc'),
    };

    // Validate booking
    const validationError = validateBooking(booking);
    if (validationError) {
        showMessage(validationError, 'error');
        return;
    }

    showMessage('Processing payment...', '');

    // Simulate payment processing
    setTimeout(async () => {
        const success = await submitBooking(booking);
        if (success) {
            // Payment and booking successful
            console.log('Booking completed:', booking);
        }
    }, 900);
});
*/
