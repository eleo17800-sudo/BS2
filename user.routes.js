import express from 'express';
import { login, signup, getAllUsers, getUserById } from '../controllers/user.controller.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:id', adminAuth, getUserById);

export default router;