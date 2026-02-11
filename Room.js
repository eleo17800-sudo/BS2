import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    space: {
        type: String,
        required: true,
        // Floor/Location
    },
    capacity: {
        type: Number,
        required: true,
        index: true
    },
    amenities: {
        type: [String],
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Booked', 'Maintenance'],
        default: 'Available',
        index: true
    }
}, {
    timestamps: true,
    collection: 'rooms'
});

module.exports = mongoose.model('Room', roomSchema);