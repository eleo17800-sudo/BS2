import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import sendMail from 'nodemailer';

const router = express();

// SIGNUP ROUTE
export async function signup(req, res) {
    const { email, password, fullName, department } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if email is admin email
    if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
        return res.status(403).json({ error: 'Cannot use admin email for signup' });
    }

    try {
        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            email,
            passwordHash,
            fullName,
            department: department || null,
            role: 'user'
        });

        await newUser.save();

        console.log(`✅ New user registered: ${email}`);

        // Send welcome email (don't wait for it)
        sendMail(
            email,
            'Welcome to SwahiliPot Hub Booking System!',
            `Hello ${fullName},\n\nWelcome to SwahiliPot Hub Room Booking System! You can now book rooms for your meetings and events.\n\nBest regards,\nSwahiliPot Hub Team`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0B4F6C;">Welcome to SwahiliPot Hub!</h2>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>Welcome to SwahiliPot Hub Room Booking System! You can now book rooms for your meetings and events.</p>
                <p>Get started by logging in and exploring the available rooms.</p>
                <br>
                <p>Best regards,<br><strong>SwahiliPot Hub Team</strong></p>
            </div>
            `
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser._id
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// LOGIN ROUTE
export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (match) {
            console.log(`✅ User logged in: ${user.email}`);

            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    department: user.department,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// GET ALL USERS (Admin only)
export async function getAllUsers(_req, res) {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET SINGLE USER (Admin only)
export async function getUserById(req, res) {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};