import express from 'express';
import Booking from '../models/Booking.js';
import sendMail from 'nodemailer';

const router = express.Router();

// BOOK ROOM
export async function bookRoom(req, res) {
    const { userId, roomId, bookingDate, startTime, endTime, type } = req.body;

    if (!userId || !roomId || !bookingDate || !startTime || !endTime || !type) {
        return res.status(400).json({ error: 'All booking details are required' });
    }
    
    try {
        const newBooking = new Booking({
            user_id: userId,
            room_id: roomId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            type,
            status: 'pending'
        });
        await newBooking.save();
        
        const mailOptions = {
            to: req.body.userEmail,
            subject: '📧 Booking Request Received',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #2196F3; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2196F3;">Booking Request Submitted</h2>
                <p>Your booking request has been received and is pending approval.</p>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${bookingDate}</p>
                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${startTime} - ${endTime}</p>
                    <p style="margin: 5px 0;"><strong>📝 Type:</strong> ${type}</p>
                </div>
                <p>You will receive another email once your request has been reviewed.</p>
            </div>`
        };

        await sendMail(mailOptions.to, mailOptions.subject, 'Booking request received', mailOptions.html);
        res.status(201).json({ message: 'Booking request submitted successfully', bookingId: newBooking._id });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to submit booking request' });
    }
}

// UPDATE BOOKING STATUS
export async function updateBookingStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        const mailOptions = {
            to: req.body.userEmail,
            subject: `📧 Booking ${status === 'confirmed' ? 'Approved' : 'Cancelled'}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #2196F3; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2196F3;">Booking ${status === 'confirmed' ? 'Approved' : 'Cancelled'}</h2>
                <p>Your booking request has been ${status === 'confirmed' ? 'approved' : 'cancelled'}.</p>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${booking.booking_date.toISOString().split('T')[0]}</p>
                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
                    <p style="margin: 5px 0;"><strong>📝 Type:</strong> ${booking.type}</p>
                </div>
                <p>${status === 'confirmed' ? 'We look forward to seeing you!' : 'Please contact support if you have any questions.'}</p>
            </div>`
        };

        await sendMail(mailOptions.to, mailOptions.subject, `Booking ${status === 'confirmed' ? 'approved' : 'cancelled'}`, mailOptions.html);
        res.json({ message: `Booking ${status} successfully` });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
}

// GET ALL BOOKINGS
export async function getAllBookings(_req, res) {
    try {
        const bookings = await Booking.find()
            .populate('user_id', 'fullName email')
            .populate('room_id', 'name space capacity')
            .sort({ booking_date: -1, start_time: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
}

// GET USER BOOKINGS
export async function getUserBookings(req, res) {
    const { userId } = req.params;

    try {
        const bookings = await Booking.find({ user_id: userId })
            .populate('room_id', 'name space capacity')
            .sort({ booking_date: -1, start_time: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
}
