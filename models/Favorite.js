import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  className: String, classImage: String, category: String, trainerName: String, price: Number,
}, { timestamps: true });

favoriteSchema.index({ userId: 1, classId: 1 }, { unique: true });
export default mongoose.model('Favorite', favoriteSchema);
