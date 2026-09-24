import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: { type: String, select: false },
    position: { type: String, trim: true, maxlength: 60, default: "" },
    embedding: {
      status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "READY", "FAILED"],
        default: "PENDING",
      },
      dims: { type: Number, default: 3072 },
      vector: { type: [Number] },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: { type: Date, default: null },
      updatedAt: { type: Date, default: null },
      lastError: { type: String, default: null },
    },
  },
  { timestamps: true },
);

// Hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

export const User = mongoose.model("User", userSchema);
