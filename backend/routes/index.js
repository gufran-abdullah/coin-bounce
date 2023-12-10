const express = require('express');
const authController = require('../controllers/authController');


const router = express.Router();
// Testing
//router.get('/test', (req, res) => res.json({msg: 'Working!'}));

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);

module.exports = router;