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

  // Status filter — explicitly exclude pending/rejected from 'all'
  if (status === 'all') {
    query.status = { $nin: ['pending', 'rejected'] };
  } else {
    query.status = status;
  }

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
  const item = await Item.findById(req.params.id).populate('postedBy', 'name avatar email phone');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  // Security block: Pending or rejected items are hidden from public
  if (item.status === 'pending' || item.status === 'rejected') {
    let isAuthorized = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
        const User = require('../models/User.model');
        const user = await User.findById(decoded.id);
        if (user && (user.role === 'admin' || item.postedBy._id.toString() === user._id.toString())) {
          isAuthorized = true;
        }
      } catch (err) {}
    }
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Item is pending admin approval' });
    }
  }

  // Only increment views if not pending
  if (item.status !== 'pending') {
    item.views += 1;
    await item.save();
  }

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

exports.claimItem = async (req, res) => {
  const sendEmail = require('../utils/sendEmail');
  const User = require('../models/User.model');

  const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.type !== 'found') return res.status(400).json({ success: false, message: 'Only found items can be claimed' });
  if (item.status !== 'active') return res.status(400).json({ success: false, message: 'This item is no longer available to claim' });
  if (item.postedBy._id.toString() === req.user._id.toString())
    return res.status(403).json({ success: false, message: 'You cannot claim your own item' });

  item.status = 'claimed';
  item.claimedBy = req.user._id;
  await item.save();

  // Respond immediately — email runs in background
  res.json({ success: true, item });

  // Fire-and-forget: notify the poster
  try {
    const claimer = req.user; // already populated by protect middleware
    const poster  = item.postedBy;
    const itemUrl = `${process.env.CLIENT_URL}/items/${item._id}`;

    await sendEmail({
      to: poster.email,
      subject: `🙋 Someone claimed your item — "${item.title}"`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;color:#fff;letter-spacing:-0.5px;">Back2U</h1>
            <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Campus Lost & Found</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 40px;">
            <h2 style="margin:0 0 8px;font-size:22px;color:#f8fafc;">Great news, ${poster.name}! 🎉</h2>
            <p style="margin:0 0 24px;color:#94a3b8;line-height:1.6;">
              Someone has claimed your found item. Here are the details:
            </p>

            <!-- Item Card -->
            <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Item</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:#f1f5f9;">${item.title}</p>
            </div>

            <!-- Claimer Card -->
            <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
              <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Claimed By</p>
              <table style="border-collapse:collapse;width:100%;">
                <tr>
                  <td style="padding:4px 0;color:#94a3b8;width:80px;">Name</td>
                  <td style="padding:4px 0;color:#f1f5f9;font-weight:600;">${claimer.name}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#94a3b8;">Email</td>
                  <td style="padding:4px 0;color:#f1f5f9;font-weight:600;">
                    <a href="mailto:${claimer.email}" style="color:#818cf8;text-decoration:none;">${claimer.email}</a>
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin:0 0 24px;color:#94a3b8;line-height:1.6;">
              Please reach out to <strong style="color:#f1f5f9;">${claimer.name}</strong> to arrange the handover. 
              If this claim seems incorrect, you can view the item and take action below.
            </p>

            <!-- CTA -->
            <a href="${itemUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
              View Item →
            </a>
          </div>

          <!-- Footer -->
          <div style="padding:20px 40px;background:#0f172a;border-top:1px solid #1e293b;text-align:center;">
            <p style="margin:0;font-size:12px;color:#475569;">
              Back2U Campus Lost & Found · Bennett University<br>
              <a href="${itemUrl}" style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('[claimItem] Email notification failed:', emailErr.message);
  }
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
