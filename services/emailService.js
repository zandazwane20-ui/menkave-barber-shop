const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send booking notification to admin
async function sendBookingNotification(booking) {
    try {
        const servicesList = booking.services.map(item =>
            `• ${item.service} - R${item.price}`
        ).join('\n');

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 New Booking Alert - ${booking.name} (${booking.date} ${booking.time})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f4b52b;">New Booking Alert!</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Customer Details:</h3>
                        <p><strong>Name:</strong> ${booking.name}</p>
                        <p><strong>Email:</strong> ${booking.email}</p>
                        <p><strong>Phone:</strong> ${booking.phone}</p>

                        <h3>Booking Details:</h3>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Time:</strong> ${booking.time}</p>

                        <h3>Services:</h3>
                        <pre style="background: white; padding: 10px; border-radius: 4px;">${servicesList}</pre>

                        <p><strong>Total Price:</strong> R${booking.totalPrice}</p>
                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                        <p><strong>Status:</strong> ${booking.bookingStatus}</p>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated notification from Menkave Barber Shop booking system.
                    </p>
                </div>
            `,
            text: `
New Booking Alert!

Customer: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}

Booking: ${booking.date} at ${booking.time}

Services:
${servicesList}

Total: R${booking.totalPrice}
Booking ID: ${booking.id}
Status: ${booking.bookingStatus}

---
Menkave Barber Shop - Automated Notification
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Booking notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('✗ Failed to send booking notification:', error);
        return false;
    }
}

// Send booking confirmation to customer
async function sendBookingConfirmation(booking) {
    try {
        const servicesList = booking.services.map(item =>
            `• ${item.service} - R${item.price}`
        ).join('\n');

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: booking.email,
            subject: `✅ Booking Confirmed - Menkave Barber Shop`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f4b52b;">Booking Confirmed!</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p>Hi ${booking.name},</p>
                        <p>Your booking has been confirmed! Here are the details:</p>

                        <h3>Booking Details:</h3>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Time:</strong> ${booking.time}</p>

                        <h3>Services:</h3>
                        <pre style="background: white; padding: 10px; border-radius: 4px;">${servicesList}</pre>

                        <p><strong>Total Price:</strong> R${booking.totalPrice}</p>
                        <p><strong>Booking ID:</strong> ${booking.id}</p>

                        <div style="background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <p><strong>📍 Location:</strong> Pimville Menkave Barber Shop, Soweto</p>
                            <p><strong>📞 Contact:</strong> Call us if you need to reschedule</p>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        Thank you for choosing Menkave Barber Shop! We look forward to seeing you.
                    </p>
                </div>
            `,
            text: `
Booking Confirmed!

Hi ${booking.name},

Your booking has been confirmed!

Date: ${booking.date}
Time: ${booking.time}

Services:
${servicesList}

Total: R${booking.totalPrice}
Booking ID: ${booking.id}

Location: Pimville Menkave Barber Shop, Soweto

Thank you for choosing Menkave Barber Shop!
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Booking confirmation sent to customer:', info.messageId);
        return true;
    } catch (error) {
        console.error('✗ Failed to send booking confirmation:', error);
        return false;
    }
}

module.exports = {
    sendBookingNotification,
    sendBookingConfirmation
};