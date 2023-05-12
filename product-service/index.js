const express = require("express");
const app = express();
const PORT = 8080;
const Product = require("./Product");
const amqp = require("amqplib");
const isAuthenticated = require("./isAuthenticated");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "PRODUCT";
let channel;
var order;

// Connect to MongoDb
require("./db");

app.use(express.json());

app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );

  channel.consume("PRODUCT", (data) => {
    order = JSON.parse(data.content);
    channel.ack(data);
    return res.json({ status: 1, message: "Success", data: order });
  });
});

app.post("/product/create", isAuthenticated, async (req, res) => {
  console.log("create product", req.body);
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
  });
  newProduct.save();
  return res.json(newProduct);
});

app.listen(PORT, async () => {
  console.log(`Product-Service at ${PORT}`);

  // Connect to RabbitMQ
  setTimeout(async () => {
    const connection = await amqp.connect(RABBITMQ_URL);
    console.log("Connected to RabbitMQ!");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);
    console.log(`Initialized queue '${QUEUE_NAME}' on channel`);
  }, 8000);
});
