import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.index({ quoteId: 1, username: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model("Like", LikeSchema, "likes");
