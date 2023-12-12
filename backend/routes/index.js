const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const blogController = require('../controllers/blogController');
const commentController = require('../controllers/commentController');


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

// ================Comment==================
// Create
router.post('/comment', auth, commentController.create);
// Get By Id
router.get('/comment/:id', auth, commentController.getById);

module.exports = router;