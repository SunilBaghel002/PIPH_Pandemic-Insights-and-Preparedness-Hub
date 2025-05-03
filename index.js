const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();
const port = 5000;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_bZWOcTtgLAp6U8",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "GA6BjC4wSaj0hdDgxq0yAmv4",
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads folder created:", uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// MongoDB Setup
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost/pandemic")
  .then(() => console.log("Database is ready..!"))
  .catch((err) => console.log("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  username: { type: String },
  photo: { type: String },
  phone: { type: String },
  dob: { type: Date },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  volunteerData: [
    {
      orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
      },
      tasks: [
        { description: String, assignedAt: { type: Date, default: Date.now } },
      ],
      hours: { type: Number, default: 0 },
      contributions: { type: Number, default: 0 },
      skills: { type: String }, // Added for volunteer skills
      badges: { type: [String], default: [] }, // Added for gamification
      bio: { type: String }, // Added for volunteer spotlight
    },
  ],
  tasksCompleted: { type: Number, default: 0 },
  isOrgHead: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }, // Added for admin access
});
const User = mongoose.model("User", userSchema);

const counterSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  currentId: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// Updated Request Schema for Resource Allocation System
const requestSchema = new mongoose.Schema({
  request_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  contactInformation: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  aadhar: { type: String },
  address: { type: String, required: true },
  wardno: { type: String },
  pincode: { type: String, required: true },
  familySize: { type: String },
  requestType: { type: String, required: true },
  description: { type: String },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      category: { type: String, required: true },
    },
  ],
  totalAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ["upi", "cards", "netbanking", "cod"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentId: { type: String },
  location: { type: String },
  userEmail: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected", "delivered"],
  },
});

const Request = mongoose.model("Request", requestSchema);

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  stock: { type: Number, default: 0 },
});
const Resource = mongoose.model("Resource", resourceSchema);

// Keep existing Donation schema
const donationSchema = new mongoose.Schema({
  type: String,
  quantity: Number,
  location: String,
  contact: String,
  status: String,
  createdAt: Date,
});
const Donation = mongoose.model("Donation", donationSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  requestId: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, default: "created" },
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.model("Payment", paymentSchema);

let otpStorage = {};

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/home.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/log-in.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/sign-up.html"))
);
app.get("/firstPage", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/firstPage.html"))
);
app.get("/request", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/request.html"))
);
app.get("/map", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/map.html"))
);

app.listen(port, () => {
  console.log(`Server starts at port ${port}`);
});
