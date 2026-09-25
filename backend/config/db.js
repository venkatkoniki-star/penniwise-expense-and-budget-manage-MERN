const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_manager';

  if (mongoURI.includes('<db_password>')) {
    console.warn('⚠️ MONGODB_URI contains placeholder <db_password>. Falling back to local MongoDB: mongodb://127.0.0.1:27017/expense_manager');
    mongoURI = 'mongodb://127.0.0.1:27017/expense_manager';
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (mongoURI !== 'mongodb://127.0.0.1:27017/expense_manager') {
      try {
        console.log('🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/expense_manager)...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/expense_manager');
        console.log(`✅ MongoDB Connected to local instance: ${localConn.connection.host}/${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`❌ Local MongoDB connection error: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;