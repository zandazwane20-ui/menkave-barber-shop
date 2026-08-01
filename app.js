// ===== BACKEND API CONFIGURATION =====
const API_BASE_URL = 'http://localhost:5000/api';

// ===== SLOT RESERVATION SYSTEM (BACKEND) =====

// Get booked slots for a date from backend
async function getBookedSlotsForDate(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/slots/${date}`);
        if (!response.ok) throw new Error('Failed to fetch slots');
        
        const data = await response.json();
        return data.bookedSlots || [];
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        // Fallback to empty array if backend is unavailable
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

// Get total price from cart
function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

// Submit booking to backend
async function submitBookingToBackend(bookingData) {
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
            services: cart,
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
        
        showMessage(`✓ Booking confirmed! Reservation ID: ${result.booking.id}. Check your email for confirmation.`, 'success');
        clearForm();
        
        return true;
    } catch (error) {
        console.error('Booking error:', error);
        showMessage(`Error: ${error.message}`, 'error');
        return false;
    }
}

const servicePrices = {
    "Haircut": 450,
    "Beard Trim": 300,
    "Style & Finish": 600,
    "Shave": 250,
    "Hair Wash": 150,
    "Facial": 400,
};

const bookingForm = document.getElementById('booking-form');
const priceDisplay = document.getElementById('service-price');
const formMessage = document.getElementById('form-message');

function updateBookingSummary() {
    const summary = document.getElementById('cart-summary');
    const priceDisplay = document.getElementById('service-price');
    
    if (cart.length === 0) {
        summary.innerHTML = '<p style="color: var(--danger);">No services selected. Please add services to cart first.</p>';
        priceDisplay.textContent = 'R0';
        return;
    }
    
    let html = '<h4>Selected Services:</h4><ul>';
    let total = 0;
    cart.forEach(item => {
        total += item.price;
        html += `<li><span>${item.service}</span><span>R${item.price}</span></li>`;
    });
    html += '</ul>';
    summary.innerHTML = html;
    priceDisplay.textContent = `R${total}`;
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function validateBooking(data) {
    if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
        return 'Please fill in your contact information.';
    }
    if (!data.date || !data.time) {
        return 'Please select a booking date and time.';
    }
    if (cart.length === 0) {
        return 'Please add services to cart before booking.';
    }
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        return 'Please select a valid date in the future.';
    }
    // Check if selected date is Monday (we're closed)
    if (selectedDate.getDay() === 1) {
        return 'We are closed on Mondays. Please select another day.';
    }
    const cardNumber = data.cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
        return 'Please enter a valid 16-digit card number.';
    }
    if (!/^\d{2}\/\d{2}$/.test(data.expiry)) {
        return 'Please enter expiry in MM/YY format.';
    }
    if (!/^\d{3,4}$/.test(data.cvc)) {
        return 'Please enter a valid CVC code.';
    }
    return null;
}

// Cart functionality
let cart = [];

function addToCart(service, price) {
    cart.push({service, price});
    updateCartDisplay();
    updateBookingSummary();
    showCart();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartCount.textContent = `R${total}`;
}

function showCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.service}</span>
            <span>R${item.price}</span>
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        cartItems.appendChild(itemDiv);
    });
    
    cartTotal.innerHTML = `<span>Total: R${total}</span>`;
    
    modal.style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    updateBookingSummary();
    showCart();
}

document.addEventListener('DOMContentLoaded', () => {
    // Add date change listener to update available time slots
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('change', updateTimeSlotOptions);
    }
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        servicesGrid.addEventListener('click', (event) => {
            const btn = event.target.closest('.add-to-cart-btn');
            if (!btn) return;

            const service = btn.getAttribute('data-service');
            const priceElement = btn.closest('.service-card')?.querySelector('.price');
            const price = priceElement ? parseInt(priceElement.textContent.replace('R', '')) : 0;

            if (service && !Number.isNaN(price)) {
                addToCart(service, price);
            }
        });
    }
    
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', showCart);
    }
    
    document.querySelector('.close').addEventListener('click', closeCart);
    
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            closeCart();
        }
    });
    
    // Cart functionality - only run if cart items exist
    const cartItemsElement = document.getElementById('cart-items');
    if (cartItemsElement) {
        cartItemsElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-btn')) {
                const index = event.target.getAttribute('data-index');
                removeFromCart(index);
            }
        });
    }

    // Set minimum date to today for date picker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today; // Set default to today
        
        // Load available slots for today on page load
        updateTimeSlotOptions();
    }

    updateBookingSummary();

    // Image Modal functionality - only run if modal exists
    const modal = document.getElementById('image-modal');
    if (modal) {
        const modalImg = document.getElementById('modal-image');
        const captionText = document.getElementById('image-caption');
        const closeBtn = document.querySelector('.image-close');

        // Add click event to all gallery images
        const galleryImages = document.querySelectorAll('.gallery-card img');
        galleryImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
            });
        });

        // Close modal when clicking the close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }

        // Close modal when clicking outside the image
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Review Modal functionality
    const reviewModal = document.getElementById('review-modal');
    const leaveReviewBtn = document.getElementById('leave-review-btn');
    const reviewClose = document.querySelector('.review-close');
    const reviewForm = document.getElementById('review-form');
    const reviewMessage = document.getElementById('review-message');

    if (leaveReviewBtn && reviewModal) {
        // Open review modal
        leaveReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'block';
        });

        // Close review modal
        if (reviewClose) {
            reviewClose.addEventListener('click', () => {
                reviewModal.style.display = 'none';
                reviewForm.reset();
                reviewMessage.innerHTML = '';
            });
        }

        // Close on outside click
        window.addEventListener('click', (event) => {
            if (event.target === reviewModal) {
                reviewModal.style.display = 'none';
                reviewForm.reset();
                reviewMessage.innerHTML = '';
            }
        });

        // Handle review form submission
        if (reviewForm) {
            reviewForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const formData = new FormData(reviewForm);
                const reviewData = {
                    name: formData.get('review-name'),
                    email: formData.get('review-email'),
                    rating: formData.get('review-rating'),
                    review: formData.get('review-text')
                };

                // Send email using EmailJS
                // Note: You need to set up EmailJS account and replace with your service/template IDs
                emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key

                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
                    from_name: reviewData.name,
                    from_email: reviewData.email,
                    rating: reviewData.rating,
                    message: reviewData.review,
                    to_email: 'hello@menkave.co.za' // Your email
                })
                .then(() => {
                    reviewMessage.innerHTML = '<p style="color: var(--success);">Thank you for your review! We\'ll review it and add it to our site.</p>';
                    reviewForm.reset();
                    setTimeout(() => {
                        reviewModal.style.display = 'none';
                        reviewMessage.innerHTML = '';
                    }, 3000);
                })
                .catch((error) => {
                    console.error('EmailJS error:', error);
                    reviewMessage.innerHTML = '<p style="color: var(--danger);">Sorry, there was an error submitting your review. Please try again.</p>';
                });
            });
        }
    }
});

function clearForm() {
    bookingForm.reset();
    updateBookingSummary();
}

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

    const validationError = validateBooking(booking);
    if (validationError) {
        showMessage(validationError, 'error');
        return;
    }

    showMessage('Processing payment...', '');

    // Simulate payment processing, then submit to backend
    setTimeout(async () => {
        const success = await submitBookingToBackend(booking);
        if (!success) {
            // Error messages already shown by submitBookingToBackend
        }
    }, 900);
});

// Service card click functionality
// Keeps the interface responsive by jumping the user to the booking section
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
});
