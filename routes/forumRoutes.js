import express from 'express';
import ForumPost from '../models/ForumPost.js';
import Comment from '../models/Comment.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import verifyTrainer from '../middleware/verifyTrainer.js';

const router = express.Router();

// Public - paginated posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      ForumPost.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      ForumPost.countDocuments(),
    ]);
    res.json({ posts, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Public - latest 4 for homepage
router.get('/latest', async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 }).limit(4);
    res.json(posts);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Admin - all posts
router.get('/all/manage', verifyAdmin, async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Trainer - own posts (must be before /:id)
router.get('/my-posts', verifyTrainer, async (req, res) => {
  try {
    const posts = await ForumPost.find({ authorId: req.user.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Private - single post + increment views
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create post (trainer or admin)
router.post('/', verifyTrainer, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const post = await ForumPost.create({ ...req.body, authorId: req.user.userId, authorRole: req.user.role });
    res.status(201).json(post);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, authorId: req.user.userId };
    const post = await ForumPost.findOneAndDelete(query);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Like / Dislike
router.post('/:id/react', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const { type } = req.body;
    const userId = req.user.userId;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (type === 'like') {
      if (post.likes.includes(userId)) { post.likes = post.likes.filter(id => id !== userId); }
      else { post.likes.push(userId); post.dislikes = post.dislikes.filter(id => id !== userId); }
    } else {
      if (post.dislikes.includes(userId)) { post.dislikes = post.dislikes.filter(id => id !== userId); }
      else { post.dislikes.push(userId); post.likes = post.likes.filter(id => id !== userId); }
    }
    await post.save();
    res.json(post);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Comments
router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const comment = await Comment.create({
      postId: req.params.id, userId: req.user.userId,
      userName: req.body.userName, userImage: req.body.userImage, content: req.body.content,
    });
    res.status(201).json(comment);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, userId: req.user.userId },
      { content: req.body.content, updatedAt: new Date() }, { new: true }
    );
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json(comment);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.commentId } : { _id: req.params.commentId, userId: req.user.userId };
    const comment = await Comment.findOneAndDelete(query);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Add reply to comment
router.post('/comments/:commentId/replies', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $push: { replies: { userId: req.user.userId, userName: req.body.userName, userImage: req.body.userImage, content: req.body.content } } },
      { new: true }
    );
    res.json(comment);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
