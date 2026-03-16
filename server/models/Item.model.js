const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type:        { type: String, enum: ['lost', 'found'], required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    enum: ['electronics','keys','wallet','bag','clothing','pet','documents','jewelry','other'],
    required: true
  },
  images:      [{ url: String, publicId: String }],
  status:      { type: String, enum: ['active', 'claimed', 'resolved', 'expired'], default: 'active' },
  location: {
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
  },
  dateLostFound: { type: Date, required: true },
  reward:        { type: Number, default: 0 },
  postedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  views:         { type: Number, default: 0 },
  tags:          [String],
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text', tags: 'text' });
itemSchema.index({ 'location.city': 1, category: 1, type: 1, status: 1 });

module.exports = mongoose.model('Item', itemSchema);
