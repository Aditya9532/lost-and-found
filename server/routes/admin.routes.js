const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Item = require('../models/Item.model');

// Get all stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  const [totalUsers, totalItems, lostItems, foundItems, resolvedItems, activeItems] = await Promise.all([
    User.countDocuments(),
    Item.countDocuments(),
    Item.countDocuments({ type: 'lost' }),
    Item.countDocuments({ type: 'found' }),
    Item.countDocuments({ status: 'resolved' }),
    Item.countDocuments({ status: 'active' }),
  ]);
  res.json({ success: true, stats: { totalUsers, totalItems, lostItems, foundItems, resolvedItems, activeItems } });
});

// Get all items (admin)
router.get('/items', protect, adminOnly, async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const query = {};
  if (status) query.status = status;
  if (type)   query.type   = type;
  const [items, total] = await Promise.all([
    Item.find(query).populate('postedBy', 'name email').sort('-createdAt').skip((page-1)*limit).limit(+limit),
    Item.countDocuments(query)
  ]);
  res.json({ success: true, items, total, pages: Math.ceil(total/limit) });
});

// Get all users (admin)
router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find().sort('-createdAt').select('-password');
  res.json({ success: true, users });
});

// Delete any item (admin)
router.delete('/items/:id', protect, adminOnly, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Item deleted by admin' });
});

// Update item status (admin)
router.put('/items/:id', protect, adminOnly, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, item });
});

// Make user admin
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json({ success: true, user });
});

// Delete user (admin)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = router;
