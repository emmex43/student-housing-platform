const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

// Ideally, this key should be in your .env file, but for now, we put it here
const SECRET_KEY = "super-secret-key-for-student-housing"; 

app.use(cors());
app.use(express.json());

// 1. TEST ROUTE
app.get("/", (req, res) => {
  res.send("Student Housing API is running!");
});

// 2. REGISTER ROUTE (Updated to save Phone Number)
app.post("/api/register", async (req, res) => {
  try {
    // 1. Get phone from the request
    const { email, password, fullName, role, phone } = req.body; 

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone, // 2. Save it to the database
        role: role || "STUDENT",
      },
    });

    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 3. LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔑 Login attempt:", email);

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password incorrect");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate Token
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    console.log("✅ Login successful for:", user.fullName);
    
    // 4. Send response
    res.json({ message: "Login successful", token, user });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
// 4. CREATE PROPERTY ROUTE (Landlords only)
app.post("/api/properties", async (req, res) => {
  try {
    const { title, description, price, university, location, images, landlordId } = req.body;

    // Validation: Ensure all fields are there
    if (!title || !price || !university || !landlordId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price), // Convert string "50000" to number 50000
        university,
        location,
        address: location, // Using location as address for simplicity
        images: images || "https://placehold.co/600x400", // Default image if none provided
        amenities: "WiFi,Water", // Default amenities for now
        landlordId,
      },
    });

    res.status(201).json({ message: "Property created!", property: newProperty });

  } catch (error) {
    console.error("❌ Error creating property:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 5. GET ALL PROPERTIES ROUTE (For the Student Search Page)
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { landlord: true }, // Also fetch the landlord's name
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch properties" });
  }
});

// 6. GET SINGLE PROPERTY ROUTE (Dynamic)
app.get("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: { landlord: true }, // Get the landlord details too
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch property" });
  }
});

// 7. ADMIN: GET ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 8. ADMIN: VERIFY A USER
app.put("/api/users/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Could not verify user" });
  }
});

// 9. CREATE BOOKING ROUTE (Save payment info)
app.post("/api/bookings", async (req, res) => {
  try {
    const { studentId, propertyId, price } = req.body;

    const newBooking = await prisma.booking.create({
      data: {
        studentId,
        propertyId,
        totalPrice: parseFloat(price),
        startDate: new Date(), // For now, just mark today as the viewing date
        endDate: new Date(),
        status: "CONFIRMED",   // Because they just paid via Paystack
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Could not save booking" });
  }
});

// 10. GET MY BOOKINGS (With Landlord Phone Number)
app.get("/api/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { studentId: userId },
      include: { 
        property: {
          include: { 
            landlord: true // <--- THIS is the magic line. Get the owner details!
          }
        } 
      }, 
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});
// 11. MARK AS TAKEN / AVAILABLE
app.put("/api/properties/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body; // true or false

    const updated = await prisma.property.update({
      where: { id },
      data: { isAvailable: available },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// 12. DELETE PROPERTY
app.delete("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id } });
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});