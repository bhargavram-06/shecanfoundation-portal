const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Form = require('../models/Form');
const auth = require('../middleware/authMiddleware');

// @route   POST api/forms/submit
// @desc    Submit a contact/volunteer form (Public with server-side validation)
router.post('/submit', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('message', 'Message must be at least 10 characters long').isLength({ min: 10 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const newForm = new Form({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        });
        await newForm.save();
        res.json({ msg: 'Form Submitted Successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/forms/submissions
// @desc    Get all submissions (Protected for Admin Panel)
router.get('/submissions', auth, async (req, res) => {
    try {
        const submissions = await Form.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;