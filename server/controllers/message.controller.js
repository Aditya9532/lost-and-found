const Message = require('../models/Message.model');

exports.sendMessage = async (req, res) => {
  const { receiverId, itemId, content } = req.body;
  const room = [req.user._id.toString(), receiverId].sort().join('_') + '_' + itemId;
  const message = await Message.create({ room, sender: req.user._id, receiver: receiverId, item: itemId, content });
  await message.populate('sender', 'name avatar');
  res.status(201).json({ success: true, message });
};

exports.getConversation = async (req, res) => {
  const { userId, itemId } = req.params;
  const room = [req.user._id.toString(), userId].sort().join('_') + '_' + itemId;
  const messages = await Message.find({ room }).populate('sender', 'name avatar').sort('createdAt');
  await Message.updateMany({ room, receiver: req.user._id }, { read: true });
  res.json({ success: true, messages });
};

exports.getInbox = async (req, res) => {
  const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    .populate('sender receiver', 'name avatar')
    .populate('item', 'title images')
    .sort('-createdAt');
  res.json({ success: true, messages });
};
