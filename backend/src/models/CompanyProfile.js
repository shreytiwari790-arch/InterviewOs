import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 600 },
    industry: String,
    accentColor: { type: String, default: '#0a9a78' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

export const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
