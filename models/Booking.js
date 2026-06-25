import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  className: { type: String, required: true },
  trainerId: { type: String, required: true },
  trainerName: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  price: { type: Number, required: true },
  transactionId: { type: String, required: true },
  schedule: [{ day: String, time: String }],
  status: { type: String, default: 'confirmed' },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
