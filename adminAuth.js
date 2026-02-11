// Consider JWT for authentication and role-based access control
import User from '../models/User.js';

const adminAuth = (req, res, next) => {
    const userId = req.header('x-user-id');

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
    }

    const user = User.findById(userId).exec();

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
};

export default adminAuth;