const Item = require('../models/Item.model');

exports.createItem = async (req, res) => {
  const images = req.files?.map(f => ({ url: `/uploads/${f.filename}`, publicId: f.filename })) || [];
  const item = await Item.create({ ...req.body, images, postedBy: req.user._id });
  res.status(201).json({ success: true, item });
};

exports.getItems = async (req, res) => {
  const {
    type, category, block, status = 'active',
    search, page = 1, limit = 12,
    rewardOnly, dateFrom, dateTo, sortBy = 'newest'
  } = req.query;

  const query = {};

  // Status filter — if 'all' is passed skip; otherwise default to active
  if (status !== 'all') query.status = status;

  if (type)      query.type = type;
  if (category)  query.category = category;
  if (block && block !== 'all') query['location.block'] = block;
  if (search)    query.$text = { $search: search };
  if (rewardOnly === 'true') query.reward = { $gt: 0 };

  // Date range filter on dateLostFound
  if (dateFrom || dateTo) {
    query.dateLostFound = {};
    if (dateFrom) query.dateLostFound.$gte = new Date(dateFrom);
    if (dateTo)   query.dateLostFound.$lte = new Date(dateTo + 'T23:59:59');
  }

  // Sort
  const sortMap = {
    newest:   '-createdAt',
    oldest:   'createdAt',
    recent:   '-dateLostFound',
    reward:   '-reward',
  };
  const sort = sortMap[sortBy] || '-createdAt';

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Item.find(query).populate('postedBy', 'name avatar').sort(sort).skip(skip).limit(+limit),
    Item.countDocuments(query),
  ]);
  res.json({ success: true, items, total, pages: Math.ceil(total / limit), page: +page });
};

exports.getItem = async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id, { $inc: { views: 1 } }, { new: true }
  ).populate('postedBy', 'name avatar email phone');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, item });
};

exports.updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, item: updated });
};

exports.deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  await item.deleteOne();
  res.json({ success: true, message: 'Item deleted' });
};

exports.getMyItems = async (req, res) => {
  const items = await Item.find({ postedBy: req.user._id }).sort('-createdAt');
  res.json({ success: true, items });
};
