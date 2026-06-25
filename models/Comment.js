import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: String, userName: String, userImage: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
  content: { type: String, required: true },
  replies: [replySchema],
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
