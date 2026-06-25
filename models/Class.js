import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: Number, required: true },
  schedule: [{ day: String, time: String }],
  price: { type: Number, required: true },
  description: { type: String, required: true },
  trainerId: { type: String, required: true },
  trainerName: { type: String, required: true },
  trainerEmail: { type: String, required: true },
  trainerImage: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
