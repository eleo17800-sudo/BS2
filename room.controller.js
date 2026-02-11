import express from 'express';
import Room from '../models/Room.js';

const router = express.Router();

// GET ROOMS
export async function getRooms(_req, res) {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

// ADD NEW ROOM (Admin only)
export async function addRoom(req, res) {
    const { name, capacity, amenities } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ error: 'Name and capacity are required' });
    }

    try {
        const newRoom = new Room({
            name,
            capacity,
            amenities: amenities || []
        });

        await newRoom.save();
        res.status(201).json({ message: 'Room added successfully', room: newRoom });
    } catch (error) {
        console.error('Add room error:', error);
        res.status(500).json({ error: 'Failed to add room' });
    }
};

// DELETE ROOM (Admin only)
export async function deleteRoom(req, res) {
    const { id } = req.params;

    try {
        const deletedRoom = await Room.findByIdAndDelete(id);

        if (!deletedRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};

// GET SINGLE ROOM
export async function getRoomById(req, res) {
    const { id } = req.params;

    try {
        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};
