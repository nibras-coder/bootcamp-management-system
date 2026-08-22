const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    fullName: { type: String, required: true, trim: true },
=======
    name: {
      type: String,
      required: true,
      trim: true,
    },
>>>>>>> origin/main
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
<<<<<<< HEAD
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "mentor", "student"],
      required: true,
      default: "student",
    },
    phone: { type: String, trim: true },
    avatarUrl: { type: String, default: "" },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
    isActive: { type: Boolean, default: true },
=======
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
>>>>>>> origin/main
  },
  { timestamps: true }
);

<<<<<<< HEAD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
=======
// Hash password before saving
userSchema.pre("save", async function () {
  // If the password wasn't changed, skip this whole function
  if (!this.isModified("password")) {
    return;
  }
  
  // Scramble the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
>>>>>>> origin/main
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
