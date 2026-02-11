import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        booking_date: {
            type: Date,
            required: true,
        },
        start_time: {
            type: String,
            required: true,
        },
        end_time: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['booking', 'reservation'],
            default: 'booking',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

bookingSchema.index(
    { room_id: 1, booking_date: 1, start_time: 1, end_time: 1 },
    { unique: true }
);


bookingSchema.index({ booking_date: 1 });
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ room_id: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);