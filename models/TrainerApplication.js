import mongoose from 'mongoose';

const trainerApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
  experience: { type: Number, required: true },
  specialty: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  feedback: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('TrainerApplication', trainerApplicationSchema);
