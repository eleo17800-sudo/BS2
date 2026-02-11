require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodeCron = require('node-cron');
const sendMail = require('./mailer');

import userRoutes from './routes/user.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: true, // Allow all origins for dev
    credentials: true
}));

app.use('/api/users', userRoutes);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await dbPromise.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// CRON JOB: Send reminders every 30 minutes
nodeCron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Running booking reminder check...');
    try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        const futureTimeStr = oneHourFromNow.toTimeString().split(' ')[0];

        const [upcoming] = await dbPromise.query(
            `SELECT b.*, u.full_name, u.email, r.name as room_name 
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.booking_date = ? 
             AND b.start_time > ? 
             AND b.start_time <= ?
             AND b.status = 'confirmed'`,
            [dateStr, timeStr, futureTimeStr]
        );

        for (const booking of upcoming) {
            console.log(`📧 Sending reminder to ${booking.email} for ${booking.room_name}`);
            sendMail(
                booking.email,
                'Upcoming Room Booking Reminder',
                `Reminder: Your booking for ${booking.room_name} is starting at ${booking.start_time}.`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #0B4F6C; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #0B4F6C;">Reminder: Upcoming Booking</h2>
                    <p>Hello <strong>${booking.full_name}</strong>,</p>
                    <p>This is a friendly reminder that your booking/reservation for <strong>${booking.room_name}</strong> is starting within the hour.</p>
                    
                    <div style="background: #f0f7fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
                        <p style="margin: 5px 0;"><strong>Location:</strong> SwahiliPot Hub</p>
                    </div>

                    <p>We look forward to seeing you!</p>
                </div>
                `
            );
        }
    } catch (error) {
        console.error('Reminder cron error:', error);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
