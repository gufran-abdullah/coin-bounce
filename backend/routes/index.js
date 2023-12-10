const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const blogController = require('../controllers/blogController');


const router = express.Router();
// Testing
//router.get('/test', (req, res) => res.json({msg: 'Working!'}));
// ================User==================
// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Logout
router.post('/logout', auth, authController.logout);
// Refresh
router.get('/refresh', authController.refresh);

// ================Blog==================
// Create
router.post('/blog', auth, blogController.create);
// Get All
router.get('/blog/all', auth, blogController.getAll);
// Get By Id
router.get('/blog/:id', auth, blogController.getById);
// Update
router.put('/blog', auth, blogController.update);
// Delete
router.delete('/blog/:id', auth, blogController.delete);

module.exports = router;