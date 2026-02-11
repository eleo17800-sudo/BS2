import express from 'express';
import { getRooms, addRoom, deleteRoom, getRoomById } from '../controllers/room.controller.js';

const router = express.Router();

router.get('/rooms', getRooms);
router.post('/add/rooms', addRoom);
router.delete('/delete/rooms/:id', deleteRoom);
router.get('/rooms/:id', getRoomById);

export default router;