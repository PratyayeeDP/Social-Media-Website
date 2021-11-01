const mongoose = require("mongoose");
const resetpasswordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uniqueKey: {
      type: String,
    },
    isValid: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const resetKey = mongoose.model("resetKey", resetpasswordSchema);
module.exports = resetKey;
