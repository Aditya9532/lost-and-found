const mongoose = require('mongoose');

// College building blocks
const COLLEGE_BLOCKS = [
  // Academic
  'A', 'B', 'N', 'P',
  // Boys Hostels
  'C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12',
  // Girls Hostels
  'D1','D2','D3','D4','D5','D6',
  // Sports
  'K',
  // Other
  'Other',
];

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
    address: { type: String, required: true },   // Specific spot (e.g. "Near cafeteria entrance")
    block:   { type: String, enum: COLLEGE_BLOCKS, required: true },
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
itemSchema.index({ 'location.block': 1, category: 1, type: 1, status: 1 });

module.exports = mongoose.model('Item', itemSchema);
