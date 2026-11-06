import mongoose from 'mongoose';

const previousTokenSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
  },
  graceUntil: {
    type: Date,
    required: true,
  },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  familyId: {
    type: String,
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  previousTokenHashes: {
    type: [previousTokenSchema],
    default: [],
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ 'previousTokenHashes.hash': 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
