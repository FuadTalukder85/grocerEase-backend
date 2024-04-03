const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
    const allProductCollection = db.collection("products");
    const allCategoryCollection = db.collection("category");

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
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("grocerease server is running");
});

app.listen(port, () => {
  console.log(`grocerease server is running on port ${port}`);
});
