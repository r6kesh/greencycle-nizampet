require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');

const seedDatabase = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI;
        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log('✅ Connected to MongoDB Atlas');
        } catch {
            console.warn('⚠️  Atlas unreachable — using in-memory MongoDB for seed');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            await mongoose.connect(mongoUri);
            console.log('✅ Connected to in-memory MongoDB');
        }

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', salt);

        const admin = await User.create({
            name: 'Admin',
            phone: process.env.ADMIN_PHONE || '+919876543210',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isActive: true
        });
        console.log(`👤 Admin created: ${admin.phone}`);

        // Create demo agent
        const agentPassword = await bcrypt.hash('agent123', salt);
        const agent = await User.create({
            name: 'Raju Kumar',
            phone: '+919876543211',
            password: agentPassword,
            role: 'agent',
            isVerified: true,
            isActive: true,
            agentArea: 'Nizampet',
            agentVehicle: 'Auto Rickshaw',
            agentRating: 4.8
        });
        console.log(`🚛 Agent created: ${agent.name}`);

        // Create scrap categories
        const categories = [
            {
                name: 'Newspaper',
                icon: '📰',
                pricePerKg: 14,
                description: 'Old newspapers, magazines, and paper waste',
                color: '#F59E0B',
                sortOrder: 1
            },
            {
                name: 'Cardboard',
                icon: '📦',
                pricePerKg: 8,
                description: 'Corrugated boxes, cartons, and packaging',
                color: '#D97706',
                sortOrder: 2
            },
            {
                name: 'Plastic',
                icon: '🧴',
                pricePerKg: 10,
                description: 'Plastic bottles, containers, and packaging',
                color: '#3B82F6',
                sortOrder: 3
            },
            {
                name: 'Iron',
                icon: '⚙️',
                pricePerKg: 28,
                description: 'Iron rods, sheets, utensils, and scrap',
                color: '#6B7280',
                sortOrder: 4
            },
            {
                name: 'Steel',
                icon: '🔩',
                pricePerKg: 35,
                description: 'Stainless steel items and utensils',
                color: '#9CA3AF',
                sortOrder: 5
            },
            {
                name: 'Aluminium',
                icon: '🥫',
                pricePerKg: 105,
                description: 'Aluminium cans, foil, utensils',
                color: '#E5E7EB',
                sortOrder: 6
            },
            {
                name: 'Copper',
                icon: '🔶',
                pricePerKg: 425,
                description: 'Copper wire, pipes, and scrap',
                color: '#B45309',
                sortOrder: 7
            },
            {
                name: 'E-Waste',
                icon: '💻',
                pricePerKg: 20,
                description: 'Old electronics, computers, phones',
                color: '#10B981',
                sortOrder: 8
            },
            {
                name: 'Others',
                icon: '♻️',
                pricePerKg: 5,
                description: 'Mixed scrap and miscellaneous items',
                color: '#8B5CF6',
                sortOrder: 9
            }
        ];

        for (const cat of categories) {
            await Category.create(cat);
        }
        console.log(`📦 ${categories.length} categories created`);

        // Create demo customer
        const customer = await User.create({
            name: 'Demo Customer',
            phone: '+919876543212',
            role: 'customer',
            isVerified: true,
            addresses: [{
                label: 'Home',
                fullAddress: '123, Main Road, Nizampet, Hyderabad',
                city: 'Hyderabad',
                pincode: '500090',
                isDefault: true
            }]
        });
        console.log(`👤 Demo customer created: ${customer.phone}`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login credentials:');
        console.log(`   Admin: ${process.env.ADMIN_PHONE || '+919876543210'} / ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
        console.log(`   Agent: +919876543211 / agent123`);
        console.log(`   Customer: +919876543212 (OTP login)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
