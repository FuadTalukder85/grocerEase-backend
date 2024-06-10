const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("GrocerEase");
    const usersCollection = db.collection("users");
    const allProductCollection = db.collection("products");
    const allCategoryCollection = db.collection("category");

    // Register user
    app.post("/api/v1/register", async (req, res) => {
      const { firstName, lastName, email, password } = req.body;

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      await usersCollection.insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      res.status(201).json({
        success: true,
        message: "User register successfully",
      });
    });

    // Login user
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });
      res.json({ success: true, message: "Login successfully", token });
    });

    //post product
    app.post("/create-product", async (req, res) => {
      const addProducts = req.body;
      const result = await allProductCollection.insertOne(addProducts);
      res.send(result);
    });

    //get all product
    app.get("/all-product", async (req, res) => {
      const result = await allProductCollection.find().toArray();
      res.send(result);
    });

    //get all category
    app.get("/all-category", async (req, res) => {
      const result = await allCategoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/all-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProductCollection.findOne(query);
      res.send(result);
    });

    //get all state
    app.get("/all-stats", async (req, res) => {
      const totalProducts = await allProductCollection.estimatedDocumentCount();
      res.send({
        totalProducts,
      });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get("/", (req, res) => {
      res.send("grocerease server is running");
    });

    app.listen(port, () => {
      console.log(`grocerease server is running on port ${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
