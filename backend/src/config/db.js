const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // For testing/development when local MongoDB might not be running
        if (process.env.NODE_ENV === 'development' && uri.includes('localhost')) {
            try {
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            } catch (err) {
                console.log('Local MongoDB not found, starting In-Memory MongoDB for testing...');
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
            }
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
