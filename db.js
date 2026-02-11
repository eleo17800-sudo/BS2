import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
};

connectDB();

export default mongoose;
