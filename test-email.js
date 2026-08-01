// Test Email Functionality
// Run with: node test-email.js

const { sendBookingNotification, sendBookingConfirmation } = require('./services/emailService');

async function testEmails() {
    console.log('🧪 Testing Email Notifications...\n');

    // Test booking data
    const testBooking = {
        id: '507f1f77bcf86cd799439011',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+27123456789',
        services: [
            { service: 'Chiskop', price: 50 },
            { service: 'Plain cut/Fade', price: 100 }
        ],
        date: '2026-04-20',
        time: '10:00 AM',
        totalPrice: 150,
        bookingStatus: 'confirmed'
    };

    console.log('📧 Sending admin notification...');
    const adminResult = await sendBookingNotification(testBooking);
    console.log(adminResult ? '✅ Admin notification sent' : '❌ Admin notification failed');

    console.log('\n📧 Sending customer confirmation...');
    const customerResult = await sendBookingConfirmation(testBooking);
    console.log(customerResult ? '✅ Customer confirmation sent' : '❌ Customer confirmation failed');

    console.log('\n✨ Email test complete!');
    console.log('Check your email inbox and spam folder.');
    process.exit(0);
}

// Run test if called directly
if (require.main === module) {
    testEmails().catch(console.error);
}

module.exports = { testEmails };