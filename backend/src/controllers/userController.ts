import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/userModel.js';

// ensure upload dir exists
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// storage
const storage = multer.diskStorage({
  destination: () => UPLOAD_DIR,
  filename: (req, file, cb) => {
    // safe unique filename: userId-timestamp.ext
    const userId = (req.params.id || 'anon');
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${userId}-${Date.now()}${ext}`;
    cb(null, safe);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// POST /api/users/:id/avatar (multipart form-data, field name "avatar")
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // update user
    const avatarPath = `/avatars/${file.filename}`; // served by static route
    const user = await User.findByIdAndUpdate(userId, {
      avatar: avatarPath,
      avatarSource: 'upload'
    }, { new: true });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, avatar: avatarPath, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/users/:id/avatar/default  { "choice": "robot1" }
export const chooseDefaultAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { choice } = req.body;
    // Validate choice against a server-side list
    const valid = ['robot1', 'robot2', 'colored-circle-1']; // add your options
    if (!valid.includes(choice)) return res.status(400).json({ error: 'Invalid choice' });

    // Map choice -> static URL path
    const avatarPath = `/default-avatars/${choice}.png`; // put these in public/default-avatars
    const user = await User.findByIdAndUpdate(userId, {
      avatar: avatarPath,
      avatarSource: 'default'
    }, { new: true });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, avatar: avatarPath, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
