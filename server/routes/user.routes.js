const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', protect, async (req, res) => {
  const { name, phone, location, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id, { name, phone, location, avatar }, { new: true }
  );
  res.json({ success: true, user });
});

module.exports = router;
