import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['candidate', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'candidate', index: true },
    isActive: { type: Boolean, default: true },
    sessionVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    lastLoginAt: Date,
    // Set when the candidate asks to be told about the Pro plan. Pro itself is not built yet.
    proWaitlistJoinedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        return {
          id: ret._id.toString(),
          name: ret.name,
          email: ret.email,
          role: ret.role,
          isActive: ret.isActive,
          lastLoginAt: ret.lastLoginAt,
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
        };
      },
    },
  },
);

userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
