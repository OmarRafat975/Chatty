import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, unique: true },
    password: String,
    friends: {
      type: [
        {
          userId: String,
          name: String,
          email: { type: String },
        },
      ],
      default: [],
    },
    requests: {
      type: [
        {
          userId: String,
          name: String,
          email: { type: String },
        },
      ],
      default: [],
    },
    pending: {
      type: [
        {
          userId: String,
          name: String,
          email: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
