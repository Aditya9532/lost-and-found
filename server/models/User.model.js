const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return email.endsWith('@bennett.edu.in');
      },
      message: 'Only Bennett University email (@bennett.edu.in) is allowed!'
    }
  },
  password: { type: String, required: true, minlength: 6 },
  avatar:   { type: String, default: '' },
  phone:    { type: String, default: '' },
  location: { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  // Password Reset Fields
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },

}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generates a secure raw token, stores its SHA-256 hash in DB, returns raw token for email link
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Hash before saving — never store raw tokens in DB
  this.resetPasswordToken  = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return rawToken;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
