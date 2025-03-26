const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: [{
      type: Schema.Types.ObjectId,
      ref: "Reply",
      default: [],
    }],
    tags: [{
      type: String,
      default: [],
    }],
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
