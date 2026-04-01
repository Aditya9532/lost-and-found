const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User.model');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── REGISTER ─────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, password, phone });
  res.status(201).json({ success: true, token: signToken(user._id), user });
};

// ── LOGIN ─────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  res.json({
    success: true,
    token: signToken(user._id),
    user,
    redirectTo: user.role === 'admin' ? '/admin' : '/'
  });
};

// ── GET ME ────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── FORGOT PASSWORD ───────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(404).json({ success: false, message: 'No account found with that email address.' });

  const rawToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a10; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,107,53,0.2);">
      <div style="background: linear-gradient(135deg, #ff6b35, #f59e0b); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: -1px;">🔐 Back2U</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Bennett University Campus App</p>
      </div>
      <div style="padding: 36px 32px;">
        <h2 style="color: #fff; margin: 0 0 12px; font-size: 22px;">Password Reset Request</h2>
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          We received a request to reset the password for your Bennett Back2U account. Click the button below to create a new password. This link expires in <strong style="color:#f59e0b;">1 hour</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35, #f59e0b); color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
            Reset My Password →
          </a>
        </div>
        <p style="color: rgba(255,255,255,0.35); font-size: 12px; text-align: center; margin: 0;">
          If you didn't request this, safely ignore this email. Your password won't change.<br/>
          This link will expire in 1 hour.
        </p>
      </div>
      <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
        <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin: 0;">Back2U • Bennett University Campus Network</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: '🔐 Reset Your Back2U Password', html });
    res.json({ success: true, message: 'Password reset email sent! Check your inbox.' });
  } catch (err) {
    // Roll back token if email fails
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('Email send error:', err);
    res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────
exports.resetPassword = async (req, res) => {
  // Hash the raw token from the URL to match what's stored in DB
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // must not be expired
  });

  if (!user)
    return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });

  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully! Please log in.' });
};
