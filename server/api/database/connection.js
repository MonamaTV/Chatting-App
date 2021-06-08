const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const URI = "mongodb://localhost:27017/chat_db" || process.env.MONGO_URI;
const databaseConnection = mongoose.connect(URI, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }, 
    () => {
    console.log("Database is connected...")
});

module.exports = databaseConnection;