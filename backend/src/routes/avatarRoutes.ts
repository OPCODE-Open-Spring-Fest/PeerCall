import express from 'express';
import { upload, uploadAvatar, chooseDefaultAvatar } from '../controllers/userController.js';

const router = express.Router();

// Note: in a real app protect these routes with auth middleware
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);
router.patch('/:id/avatar/default', express.json(), chooseDefaultAvatar);

export default router;
