import express from 'express';
import { getAllBookings, bookRoom, updateBookingStatus, getUserBookings } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/booking', bookRoom);
router.put('/booking/:id/status', updateBookingStatus);
router.get('/bookings', getAllBookings);
router.get('/booking/user/:userId', getUserBookings);

export default router;