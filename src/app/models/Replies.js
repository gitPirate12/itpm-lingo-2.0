const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    // The parent can be a Post OR another Reply
    parentId: {
      type: Schema.Types.ObjectId,
      refPath: "parentModel", // Dynamic reference based on the parent model type
      required: true,
    },
    parentModel: {
      type: String,
      required: true,
      enum: ["Post", "Reply"], 
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    replies: [{
      type: Schema.Types.ObjectId,
      ref: "Reply", // Self-referencing for nesting
      default: [],
    }],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Reply", replySchema);
