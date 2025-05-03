const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
dotenv.config();
const port = 5000;

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
app.get("/map", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/map.html"))
);
app.get("/request", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/request.html"))
);

const allowedEmails = [
  "sunilnp@acem.edu.in",
  "ofcsatyam007@gmail.com",
  "vanshajs11@gmail.com",
];

app.get("/admin", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.redirect("/login");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (allowedEmails.includes(decoded.email)) {
      res.sendFile(path.join(__dirname, "/views/manageRequest.html"));
    } else {
      res.status(403).send("Access denied.");
    }
  } catch (error) {
    res.redirect("/login");
  }
});

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log("Token received:", token); // Debug log
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message); // Debug log
    res.status(401).json({ error: "Invalid token" });
  }
}

async function seedInitialResources() {
  try {
    const count = await Resource.countDocuments();
    if (count === 0) {
      console.log("Seeding initial resources...");

      const foodItems = [
        {
          id: "rice",
          name: "Rice (5kg)",
          price: 10,
          category: "food",
          description: "Premium quality white rice",
          stock: 50,
        },
        {
          id: "wheat",
          name: "Wheat Flour (5kg)",
          price: 10,
          category: "food",
          description: "Whole wheat atta for chapatis",
          stock: 45,
        },
        {
          id: "dal",
          name: "Yellow Dal (1kg)",
          price: 5,
          category: "food",
          description: "Toor/Arhar dal, high protein",
          stock: 60,
        },
        // More food items
        {
          id: "oil",
          name: "Cooking Oil (1L)",
          price: 10,
          category: "food",
          description: "Refined vegetable oil",
          stock: 40,
        },
        {
          id: "sugar",
          name: "Sugar (1kg)",
          price: 5,
          category: "food",
          description: "Fine grain white sugar",
          stock: 55,
        },
        {
          id: "salt",
          name: "Salt (1kg)",
          price: 5,
          category: "food",
          description: "Iodized table salt",
          stock: 70,
        },
        {
          id: "tea",
          name: "Tea Leaves (250g)",
          price: 5,
          category: "food",
          description: "Premium black tea leaves",
          stock: 45,
        },
        {
          id: "milk",
          name: "Milk Powder (500g)",
          price: 10,
          category: "food",
          description: "Full cream milk powder",
          stock: 35,
        },
      ];

      const medicineItems = [
        {
          id: "paracetamol",
          name: "Paracetamol (10 tabs)",
          price: 5,
          category: "medicine",
          description: "Fever & pain relief tablets",
          stock: 80,
        },
        {
          id: "oRS",
          name: "ORS Packets (10)",
          price: 5,
          category: "medicine",
          description: "Oral rehydration salts",
          stock: 65,
        },
        {
          id: "vitaminC",
          name: "Vitamin C (30 tabs)",
          price: 10,
          category: "medicine",
          description: "Immunity booster supplements",
          stock: 50,
        },
        {
          id: "antiseptic",
          name: "Antiseptic Solution",
          price: 10,
          category: "medicine",
          description: "For cleaning wounds & cuts",
          stock: 55,
        },
        {
          id: "bandage",
          name: "Bandages (Pack)",
          price: 5,
          category: "medicine",
          description: "Sterile adhesive bandages",
          stock: 60,
        },
        {
          id: "coughSyrup",
          name: "Cough Syrup (100ml)",
          price: 10,
          category: "medicine",
          description: "For dry & wet cough relief",
          stock: 40,
        },
      ];

      const essentialItems = [
        {
          id: "sanitizer",
          name: "Hand Sanitizer (100ml)",
          price: 5,
          category: "essentials",
          description: "70% alcohol-based sanitizer",
          stock: 65,
        },
        {
          id: "mask",
          name: "Face Masks (10pc)",
          price: 5,
          category: "essentials",
          description: "3-ply disposable face masks",
          stock: 75,
        },
        {
          id: "soap",
          name: "Soap Bars (4pc)",
          price: 10,
          category: "essentials",
          description: "Antibacterial bathing soap",
          stock: 60,
        },
        {
          id: "detergent",
          name: "Detergent (500g)",
          price: 10,
          category: "essentials",
          description: "Washing powder for clothes",
          stock: 50,
        },
        {
          id: "candles",
          name: "Candles (Pack of 6)",
          price: 5,
          category: "essentials",
          description: "Emergency lighting solution",
          stock: 70,
        },
        {
          id: "toothpaste",
          name: "Toothpaste (100g)",
          price: 5,
          category: "essentials",
          description: "Fluoride toothpaste",
          stock: 55,
        },
        {
          id: "toilet",
          name: "Toilet Paper (4 rolls)",
          price: 10,
          category: "essentials",
          description: "Soft toilet tissue rolls",
          stock: 45,
        },
      ];

      const allResources = [...foodItems, ...medicineItems, ...essentialItems];
      await Resource.insertMany(allResources);
      console.log("Initial resources seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding resources:", error);
  }
}

// Seed initial resources when server starts
seedInitialResources();

// Get all resources by category
app.get("/api/resources", async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    const resources = await Resource.find(filter);
    res.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific resource by ID
app.get("/api/resources/:id", async (req, res) => {
  try {
    const resource = await Resource.findOne({ id: req.params.id });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update resource stock
app.put("/api/resources/:id/stock", authMiddleware, async (req, res) => {
  try {
    const { stock } = req.body;
    const resource = await Resource.findOneAndUpdate(
      { id: req.params.id },
      { stock },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    console.error("Error updating resource stock:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new resource request
app.post("/api/requests", async (req, res) => {
  try {
    const { name,
      phone,
      email,
      aadhar, // Ensure this matches the frontend key exactly
      address,
      wardno,
      pincode,
      familySize,
      items,
      totalAmount,
      paymentMethod, } =
      req.body;
    console.log("Received request body:", req.body);

    if (!name || !phone || !email || !address || !items || items.length === 0) {
      console.log("Validation failed:", { name, phone, email, address, items });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const safeAadhar = aadhar !== undefined ? aadhar : null; // Explicit check
    const safeWardno = wardno !== undefined ? wardno : null;
    const safePincode = pincode !== undefined ? pincode : null;
    const safeFamilySize = familySize !== undefined ? familySize : null;
    const counter = await Counter.findOneAndUpdate(
      { modelName: "Request" },
      { $inc: { currentId: 1 } },
      { new: true, upsert: true }
    );
    const requestId = counter.currentId;

    const newRequest = new Request({
      request_id: requestId,
      name: name,
      phone: phone,
      email: email,
      aadhar: safeAadhar, // Use the safe version
      address: address,
      wardno: safeWardno,
      pincode: safePincode,
      familySize: safeFamilySize,
      items: items,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      requestType: items[0]?.category || "mixed",
      description: `Order containing ${items.length} items`,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    });
    await newRequest.save();
    console.log("Request saved:", newRequest);

    let paymentResponse = {};
    if (paymentMethod !== "cod") {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `req_${requestId}`,
        payment_capture: 1,
      });
      console.log("Razorpay order created:", razorpayOrder);
      const payment = new Payment({
        requestId: requestId,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: "created",
      });
      await payment.save();
      paymentResponse = {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
      };
    }

    res.status(201).json({
      message: "Request submitted successfully",
      requestId,
      payment: paymentResponse,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res
      .status(500)
      .json({ message: "Failed to create request", error: error.message });
  }
});

// Verify Razorpay payment
app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      requestId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "YOUR_SECRET_KEY"
      )
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          status: "completed",
        }
      );

      // Update request payment status
      await Request.findOneAndUpdate(
        { request_id: parseInt(requestId) },
        {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
        }
      );

      // Update resource stock
      const request = await Request.findOne({
        request_id: parseInt(requestId),
      });
      if (request) {
        for (const item of request.items) {
          const resource = await Resource.findOne({ id: item.id });
          if (resource && resource.stock >= item.quantity) {
            resource.stock -= item.quantity;
            await resource.save();
          }
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      await Request.findOneAndUpdate(
        { request_id: parseInt(requestId) },
        { paymentStatus: "failed" }
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});

// Get user's requests
app.get("/api/user/requests", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const requests = await Request.find({ email }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all requests
app.get("/api/admin/requests", authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const adminUser = await User.findById(user.userId);

    if (
      !adminUser ||
      (!adminUser.isAdmin && !allowedEmails.includes(adminUser.email))
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update request status
app.put("/api/admin/requests/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const { user } = req;
    const adminUser = await User.findById(user.userId);

    if (
      !adminUser ||
      (!adminUser.isAdmin && !allowedEmails.includes(adminUser.email))
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const request = await Request.findOne({
      request_id: parseInt(req.params.id),
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    // Send notification email to user
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: request.email,
      subject: `Your Request #${
        request.request_id
      } Status: ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4361ee;">Crisis Aid Navigator</h2>
          <p>Dear ${request.name},</p>
          <p>Your request (ID: <strong>${
            request.request_id
          }</strong>) has been <strong>${status}</strong>.</p>
          <p>Status: <span style="font-weight: bold; color: ${
            status === "approved"
              ? "#4caf50"
              : status === "rejected"
              ? "#f44336"
              : status === "delivered"
              ? "#2196f3"
              : "#ff9800"
          };">${status.toUpperCase()}</span></p>
          <p>Total Amount: ₹${request.totalAmount}</p>
          <p>Payment Status: ${request.paymentStatus}</p>
          <p>Thank you for using our services during this pandemic.</p>
          <p>Stay safe and healthy!</p>
          <p style="margin-top: 20px; font-size: 12px; color: #757575;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending notification email:", error);
      } else {
        console.log("Notification email sent:", info.response);
      }
    });

    res.json({ message: `Request status updated to ${status}` });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get resource statistics
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const adminUser = await User.findById(user.userId);

    if (
      !adminUser ||
      (!adminUser.isAdmin && !allowedEmails.includes(adminUser.email))
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Count requests by status
    const pendingCount = await Request.countDocuments({ status: "pending" });
    const approvedCount = await Request.countDocuments({ status: "approved" });
    const rejectedCount = await Request.countDocuments({ status: "rejected" });
    const deliveredCount = await Request.countDocuments({
      status: "delivered",
    });

    // Count resources by category
    const foodCount = await Resource.countDocuments({ category: "food" });
    const medicineCount = await Resource.countDocuments({
      category: "medicine",
    });
    const essentialsCount = await Resource.countDocuments({
      category: "essentials",
    });

    // Get low stock items (stock <= 10)
    const lowStockItems = await Resource.find({ stock: { $lte: 10 } });

    res.json({
      requests: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        delivered: deliveredCount,
        total: pendingCount + approvedCount + rejectedCount + deliveredCount,
      },
      resources: {
        food: foodCount,
        medicine: medicineCount,
        essentials: essentialsCount,
        total: foodCount + medicineCount + essentialsCount,
        lowStock: lowStockItems,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: error.message });
  }
});

// Keep existing routes and auth functionality below
app.get("/check-email", (req, res) => {
  try {
    const userEmail = req.headers["x-user-email"];
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    console.log("Checking email:", userEmail, "Token:", token);

    if (!userEmail) {
      console.log("Email header missing");
      return res.status(400).send("Email header is missing.");
    }

    // Check if email is in allowed list
    if (allowedEmails.includes(userEmail)) {
      console.log("Access granted via email check:", userEmail);
      return res.status(200).send("Access granted.");
    }

    // If token provided, validate it
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = User.findById(decoded.userId);
        if (user && user.email === userEmail) {
          console.log("Access granted via JWT:", userEmail);
          return res.status(200).send("Access granted.");
        }
      } catch (err) {
        console.log("Invalid token:", err.message);
      }
    }

    console.log("Access denied for:", userEmail);
    return res.status(403).send("Access denied.");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Server error");
  }
});

// Keep existing authentication routes
// Registration & OTP Routes
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const otp = generateOTP();
  console.log("Generated OTP:", otp);
  otpStorage[email] = otp;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res
      .status(400)
      .json({ error: "User already exists with this email" });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Registration OTP",
    html: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP for PIPH Login</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              background-color: #1a1a1a;
              margin: 0;
              padding: 0;
              color: #e0e0e0;
              line-height: 1.6;
          }
          .container {
              width: 100%;
              max-width: 700px;
              margin: 20px auto;
              background-color:rgb(207, 199, 199);
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          .header {
              text-align: center;
              padding: 10px 15px;
              background: linear-gradient(135deg, #1f3a44, #0a2629); /* Dark gradient */
              border-bottom: 3px solid #00cccc; /* Cyan border retained */
          }
          .header img {
              max-width: 120px;
              height: auto;
              margin: 5px 0;
          }
          .header h1 {
              color: #00cccc; /* Cyan text for contrast */
              font-size: 24px;
              margin: 5px 0 0;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
          }
          .header p {
              color: #b0b0b0; /* Softer gray for subtitle */
              font-size: 14px;
              margin: 5px 0;
          }
          .banner img {
              width: 100%;
              height: auto;
              border-bottom: 2px solid #00cccc;
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .otp-box {
              font-size: 28px;
              font-weight: bold;
              color: #00cccc;
              background-color: #1a1a1a;
              padding: 12px 25px;
              display: inline-block;
              margin: 20px 0;
              border: 2px solid #00cccc;
              border-radius: 6px;
              box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
          }
          .features {
              margin: 25px 0;
              display: flex;
              justify-content: space-around;
              flex-wrap: wrap;
              padding: 0 20px;
          }
          .feature-item {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              flex: 1 1 30%;
              min-width: 200px;
          }
          .feature-item img {
              width: 28px;
              height: 28px;
              margin-right: 12px;
          }
          .footer {
              background-color: #333333;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #b0b0b0;
              border-top: 1px solid #00cccc;
          }
          a {
              color: #00cccc;
              text-decoration: none;
          }
          a:hover {
              text-decoration: underline;
              color: #00ffff;
          }
          h2 {
              color: #00cccc;
              margin: 15px 0;
              font-size: 24px;
          }
          p {
              margin: 10px 0;
          }
  
          /* Desktop Enhancements */
          @media only screen and (min-width: 601px) {
              .header {
                  padding: 15px 20px;
              }
              .header h1 {
                  font-size: 28px;
              }
              .header p {
                  font-size: 16px;
              }
              .content {
                  padding: 30px;
              }
              .otp-box {
                  font-size: 32px;
                  padding: 15px 30px;
              }
              .features {
                  padding: 0 30px;
              }
              .feature-item {
                  min-width: 180px;
              }
              .feature-item img {
                  width: 32px;
                  height: 32px;
              }
              h2 {
                  font-size: 26px;
              }
              p {
                  font-size: 16px;
              }
          }
  
          /* Mobile Optimization */
          @media only screen and (max-width: 600px) {
              .container {
                  margin: 10px;
                  border-radius: 6px;
                  max-width: 100%;
              }
              .header {
                  padding: 8px 10px;
              }
              .header img {
                  max-width: 100px;
              }
              .header h1 {
                  font-size: 20px;
              }
              .header p {
                  font-size: 12px;
              }
              .content {
                  padding: 15px;
              }
              .otp-box {
                  font-size: 22px;
                  padding: 10px 20px;
              }
              .features {
                  padding: 0 10px;
                  display: block;
              }
              .feature-item {
                  min-width: 100%;
                  margin-bottom: 12px;
              }
              .feature-item img {
                  width: 24px;
                  height: 24px;
              }
              .footer {
                  padding: 12px;
                  font-size: 10px;
              }
              h2 {
                  font-size: 20px;
              }
              p {
                  font-size: 14px !important;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <!-- Header with Logo and Title -->
          <div class="header">
              <img src="piph.png" alt="PIPH Logo">
              <h1>PIPH</h1>
              <p>Pandemic Insights And Preparedness Hub</p>
          </div>
  
          <!-- Banner (Placeholder from Google) -->
          <!-- <div class="banner">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5zXU8qO8qV8qV8qV8qV8qV8qV8qV8qV8qV8qV8qV8qV8" alt="PIPH Banner">
          </div> -->
  
          <!-- Content -->
          <div class="content">
              <h2>Building Resilience, One Step at a Time</h2>
              <p style="font-size: 16px;">
                  Hello Buddy,<br>
                  Welcome to PIPH—your hub for pandemic insights and preparedness. We’re here to empower communities with cutting-edge tools and real-time data.
              </p>
              <p style="font-size: 16px;">
                  Your One-Time Password (OTP) to log in securely:
              </p>
              <div class="otp-box">${otp}</div>
              <p style="font-size: 14px; color: #b0b0b0;">
                  Valid for 10 minutes. Keep it confidential.
              </p>
  
              <!-- Features Section with Icons -->
              <div class="features">
                  <div class="feature-item">
                      <img src="https://img.icons8.com/ios-filled/50/00cccc/clock.png" alt="Real-Time Icon">
                      <span>Real-time pandemic tracking</span>
                  </div>
                  <div class="feature-item">
                      <img src="https://img.icons8.com/ios-filled/50/00cccc/settings.png" alt="Automation Icon">
                      <span>Automated resource management</span>
                  </div>
                  <div class="feature-item">
                      <img src="https://img.icons8.com/ios-filled/50/00cccc/shield.png" alt="Resilience Icon">
                      <span>Resilience-focused tools</span>
                  </div>
              </div>
  
              <p style="font-size: 16px;">
                  Stay connected:<br>
                  <a href="[INSERT INSTAGRAM URL HERE]" target="_blank">@PIPH_Official</a> | 
                  <a href="[INSERT WEBSITE URL HERE]" target="_blank">www.piph.com</a>
              </p>
          </div>
  
          <!-- Footer -->
          <div class="footer">
              <p>Best regards,<br><strong>Satyam Pandey</strong><br>CEO, PIPH</p>
              <p>© 2025 PIPH. All rights reserved.</p>
              <p>Need help? <a href="mailto:support@piph.com">support@piph.com</a></p>
          </div>
      </div>
  </body>
  </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      return res.status(500).json({ error: "Failed to send OTP" });
    }
    res.json({ message: "OTP sent! Please verify." });
  });
});

app.post("/register/verify", async (req, res) => {
  const { email, otp, password, name, phone, dob } = req.body;

  if (otpStorage[email] !== otp)
    return res.status(400).json({ error: "Invalid OTP" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    phone,
    dob: new Date(dob),
    volunteerData: [],
  });
  await newUser.save();

  delete otpStorage[email];

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Registration successful", token });
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) return res.status(500).json({ error: "Internal error" });
    if (!result) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token });
  });
});

// Forgot Password Routes
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          body { font-family: "Poppins", serif; background-color: #f9f9f9; margin: 0; padding: 0; }
          .email-container { width: 400px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .email-header { background-color: #4caf50; color: #ffffff; text-align: center; padding: 20px; }
          .email-header img { width: 150px; }
          .email-header h1 { margin: 10px 0 0; font-size: 24px; }
          .email-body { padding: 20px; text-align: center; }
          .email-body h2 { font-size: 20px; color: #333; }
          .email-body .otp-box { background-color: #f4f4f4; font-size: 24px; color: #4caf50; padding: 15px; margin: 20px auto; width: fit-content; border-radius: 5px; border: 1px solid #ddd; }
          .email-body p { font-size: 16px; color: #555; line-height: 1.6; }
          .email-footer { text-align: center; padding: 15px; font-size: 14px; color: #777; background-color: #f4f4f4; }
          .email-footer a { color: #4caf50; text-decoration: none; }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="email-header">
              <img src="https://i.postimg.cc/pT69mFMB/logo.png" alt="Website Logo">
              <h1>Pandemic Response Hub</h1>
          </div>
          <div class="email-body">
              <h2>🔑 Password Reset</h2>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>
              <div class="otp-box">${otp}</div>
              <p><em>(This OTP is valid for the next 10 minutes.)</em></p>
              <p>If you didn’t request this, please ignore this email or <a href="#">contact support</a>.</p>
          </div>
          <div class="email-footer">
              <p>Need help? <a href="#">Visit our support page</a>.</p>
              <p>The <strong>PIPH Team</strong></p>
          </div>
      </div>
  </body>
  </html>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ error: "Failed to send OTP" });
      }
      res.json({ message: "OTP sent to your email" });
    });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

app.post("/reset-password/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ valid: false });
    }
    res.json({ valid: true });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Request & Admin Routes
app.post("/send", async (req, res) => {
  try {
    const {
      name,
      contactInformation,
      requestType,
      description,
      quantity,
      location,
      email,
    } = req.body;

    if (
      !name ||
      !contactInformation ||
      !requestType ||
      !description ||
      quantity === undefined ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const counter = await Counter.findOneAndUpdate(
      { modelName: "Request" },
      { $inc: { currentId: 1 } },
      { new: true, upsert: true }
    );
    const requestId = counter.currentId;

    const newRequest = new Request({
      request_id: requestId,
      name,
      contactInformation,
      requestType,
      description,
      quantity,
      location,
      email,
      status: "Pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request successfully stored." });
  } catch (error) {
    console.error("Error storing request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

app.put("/requests/:id", authMiddleware, async (req, res) => {
  try {
    const { status, email } = req.body;
    const requestId = parseInt(req.params.id, 10);
    const request = await Request.findOne({ request_id: requestId });

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    const updatedRequest = await request.save();

    if (status === "Approved") {
      const resource = await Resource.findOne({ type: request.requestType });
      if (resource && resource.available >= request.quantity) {
        resource.available -= request.quantity;
        resource.status =
          resource.available <= 10
            ? "low_stock"
            : resource.available === 0
            ? "out_of_stock"
            : "in_stock";
        await resource.save();
      } else {
        return res
          .status(400)
          .json({ message: "Insufficient resources available" });
      }
    }

    const data = new Date();
    const formattedDate = data.toISOString().split("T")[0];

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Request ${status}`,
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Request ${status}</title>
            <style>
              body { font-family: "Poppins", sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
              .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .email-header { background-color: ${
                status === "Approved" ? "#4caf50" : "#e74c3c"
              }; color: #ffffff; text-align: center; padding: 20px; }
              .email-body { padding: 20px; text-align: center; }
              .email-footer { text-align: center; padding: 15px; font-size: 14px; color: #777; background-color: #f4f4f4; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <h1>Request ${status}!</h1>
              </div>
              <div class="email-body">
                <h2>Your request (ID: ${requestId})</h2>
                <p>Status: ${status}</p>
                <p>Type: ${request.requestType}</p>
                <p>Quantity: ${request.quantity}</p>
                <p>Date: ${formattedDate}</p>
              </div>
              <div class="email-footer">
                <p>Thank you for using PIPH!</p>
              </div>
            </div>
          </body>
          </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      console.log("Email sent: " + info.response);
      res.json(updatedRequest);
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Error updating request status" });
  }
});

// User Profile Endpoints
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      tasksCompleted: user.tasksCompleted,
      isOrgHead: user.isOrgHead,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server starts at port ${port}`);
});
