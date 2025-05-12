const mqtt = require('mqtt');
const { mqttClient } = require('../index');

// Start a new game
exports.startGame = async (req, res) => {
  try {
    const playerName = req.body.player || 'Anonymous';
    const userId = req.user ? req.user.id : null;
    
    // Publish start game command to MQTT
    const message = {
      command: 'start',
      player: playerName,
      userId: userId,
      timestamp: new Date().toISOString()
    };
    
    mqttClient.publish('simon_says/game', JSON.stringify(message));
    
    res.status(200).json({
      status: 'success',
      message: 'Game started',
      data: {
        player: playerName
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Stop current game
exports.stopGame = async (req, res) => {
  try {
    // Publish stop game command to MQTT
    const message = {
      command: 'stop',
      timestamp: new Date().toISOString()
    };
    
    mqttClient.publish('simon_says/game', JSON.stringify(message));
    
    res.status(200).json({
      status: 'success',
      message: 'Game stopped'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get device status
exports.getDeviceStatus = async (req, res) => {
  try {
    // Response depends on whether there's an MQTT connection
    if (mqttClient && mqttClient.connected) {
      // Publish status request
      mqttClient.publish('simon_says/game', JSON.stringify({
        command: 'status',
        timestamp: new Date().toISOString()
      }));
      
      // Note: In a real implementation, we'd either:
      // 1. Use a more sophisticated mechanism to wait for device response
      // 2. Store device status in the server and return the last known status
      
      // For simplicity, we're just reporting that the device is connected
      res.status(200).json({
        status: 'success',
        data: {
          deviceStatus: 'connected',
          mqttConnected: true
        }
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          deviceStatus: 'unknown',
          mqttConnected: false
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Set custom game sequence for testing
exports.setCustomSequence = async (req, res) => {
  try {
    const { sequence } = req.body;
    
    // Validate sequence
    if (!sequence || !Array.isArray(sequence)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid sequence array'
      });
    }
    
    // Check that sequence only contains numbers 0-3
    const isValid = sequence.every(num => num >= 0 && num <= 3 && Number.isInteger(num));
    
    if (!isValid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Sequence must only contain integers between 0 and 3'
      });
    }
    
    // Publish custom sequence command to MQTT
    const message = {
      command: 'sequence',
      sequence: sequence,
      timestamp: new Date().toISOString()
    };
    
    mqttClient.publish('simon_says/game', JSON.stringify(message));
    
    res.status(200).json({
      status: 'success',
      message: 'Custom sequence set',
      data: {
        sequence
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 