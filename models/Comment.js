import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Explicitly map to the "comments" collection
export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema, "comments");
