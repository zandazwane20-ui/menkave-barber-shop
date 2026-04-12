const servicePrices = {
    "Haircut": 450,
    "Beard Trim": 300,
    "Style & Finish": 600,
    "Shave": 250,
    "Hair Wash": 150,
    "Facial": 400,
};

const bookingForm = document.getElementById('booking-form');
const serviceSelect = document.getElementById('service');
const priceDisplay = document.getElementById('service-price');
const formMessage = document.getElementById('form-message');

function updatePrice() {
    const service = serviceSelect.value;
    const price = servicePrices[service] || 0;
    priceDisplay.textContent = `R${price}`;
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
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        return 'Please select a valid date in the future.';
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

function clearForm() {
    bookingForm.reset();
    updatePrice();
}

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const booking = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
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

    setTimeout(() => {
        showMessage(`Booking confirmed for ${booking.date} at ${booking.time}.`, 'success');
        clearForm();
    }, 900);
});

serviceSelect.addEventListener('change', updatePrice);
updatePrice();

// Service card click functionality
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        const service = card.dataset.service;
        if (service) {
            serviceSelect.value = service;
            updatePrice();
            // Scroll to booking section
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        }
    });
});
