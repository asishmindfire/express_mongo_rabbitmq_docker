const express = require("express");
const app = express();
const PORT = 8081;
const Order = require("./Order");
const amqp = require("amqplib");

var channel, connection;
require("./db");
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "ORDER";

function createOrder(products, userEmail) {
  let total = 0;
  for (let t = 0; t < products.length; ++t) {
    total += products[t].price;
  }
  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total,
  });
  newOrder.save();
  return newOrder;
}

async function comsumeQueue() {
  channel.consume(QUEUE_NAME, (data) => {
    console.log("Consuming ORDER Queue");
    const { products, userEmail } = JSON.parse(data.content);
    console.log("products =>", products);
    const newOrder = createOrder(products, userEmail);
    // Acknowledge the data and remove from the queue
    channel.ack(data);
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
    console.log("Completed the order service task");
  });
}

// // Creating order queue
// async function connect() {
//   connection = await amqp.connect(RABBITMQ_URL);
//   channel = await connection.createChannel();
//   await channel.assertQueue(QUEUE_NAME);
// }
// connect().then(() => {
//   channel.consume(QUEUE_NAME, (data) => {
//     console.log("Consuming ORDER Queue");
//     const { products, userEmail } = JSON.parse(data.content);
//     console.log("products =>", products);
//     const newOrder = createOrder(products, userEmail);
//     // Acknowledge the data and remove from the queue
//     channel.ack(data);
//     channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
//   });
// });

app.listen(PORT, async () => {
  console.log(`Order-Service at ${PORT}`);

  // Creating RabbitMq Channel
  setTimeout(async () => {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);
    comsumeQueue();
  }, 8000);
});
