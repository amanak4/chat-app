const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", GroupSchema);
