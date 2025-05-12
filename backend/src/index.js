require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt');

// Import routes
const userRoutes = require('./routes/userRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const gameRoutes = require('./routes/gameRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/simon_says', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/game', gameRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Simon Says Game API' });
});

// MQTT Client setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883', {
  clientId: process.env.MQTT_CLIENT_ID || `simon_says_backend_${Math.random().toString(16).slice(2, 8)}`,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clean: true
});

// MQTT connection events
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe to score topic
  mqttClient.subscribe('simon_says/score', (err) => {
    if (!err) {
      console.log('Subscribed to simon_says/score');
    }
  });
  
  // Subscribe to device status topic
  mqttClient.subscribe('simon_says/status', (err) => {
    if (!err) {
      console.log('Subscribed to simon_says/status');
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT Error:', error);
});

mqttClient.on('message', async (topic, message) => {
  try {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    
    if (topic === 'simon_says/score') {
      const scoreData = JSON.parse(message.toString());
      
      // Import Score model
      const Score = require('./models/scoreModel');
      
      // Create a new score entry
      const score = new Score({
        player: scoreData.player || 'Anonymous',
        score: scoreData.score || 0,
        timestamp: scoreData.timestamp || new Date()
      });
      
      // Save to database
      await score.save();
      console.log('Score saved to database:', score);
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Export MQTT client for use in other files
exports.mqttClient = mqttClient;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 