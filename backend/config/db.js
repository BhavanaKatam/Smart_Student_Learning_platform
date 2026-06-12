const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async (uri) => {
  try {
    if (!uri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
