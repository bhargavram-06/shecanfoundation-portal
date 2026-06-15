const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('bhargav123', salt);

        // Find the existing admin and update their password, or create one if they don't exist
        await User.findOneAndUpdate(
            { email: 'admin@shecan.org' },
            { password: hashedPassword },
            { upsert: true, new: true }
        );

        console.log('✅ Admin Account Updated/Created Successfully!');
        console.log('Email: admin@shecan.org');
        console.log('Password: bhargav123');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();