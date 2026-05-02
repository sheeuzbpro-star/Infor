require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const User = require('./models/User');

const app = express();

// ─── MIDDLEWARE ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── MONGODB ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB ga ulandi!'))
  .catch(err => console.error('❌ MongoDB xatosi:', err));

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token noto\'g\'ri' });
  }
}

// ─── ROUTES ──────────────────────────────────────────────────

// Ro'yxatdan o'tish
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, name: user.name, email: user.email, results: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Kirish
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email va parolni kiriting' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Email yoki parol noto\'g\'ri' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Email yoki parol noto\'g\'ri' });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const results = Object.fromEntries(user.results);
    res.json({ token, name: user.name, email: user.email, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Natijani saqlash
app.post('/api/result', authMiddleware, async (req, res) => {
  try {
    const { key, pct } = req.body;
    if (!key || pct === undefined)
      return res.status(400).json({ error: 'key va pct kerak' });

    await User.findByIdAndUpdate(req.user.id, {
      $set: { [`results.${key}`]: pct }
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Foydalanuvchi ma'lumotlari
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    const results = Object.fromEntries(user.results);
    res.json({ name: user.name, email: user.email, results });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// SPA uchun fallback — barcha boshqa URL lar index.html ga
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`));
