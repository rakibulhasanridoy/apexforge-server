import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorImage: { type: String, default: '' },
  authorRole: { type: String, required: true },
  likes: [{ type: String }],
  dislikes: [{ type: String }],
  views: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ForumPost', forumPostSchema);
