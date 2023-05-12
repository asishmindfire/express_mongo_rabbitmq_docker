const mongoose = require("mongoose");

const db =
  "mongodb+srv://asish:M95Wc06MLm1hnDiv@cluster0.lj9sift.mongodb.net/order-service?retryWrites=true&w=majority";

const connect = async () => {
  try {
    await mongoose.connect(db);
    console.log("Order Service DB Connected.");
  } catch (error) {
    console.log(`Db connection failure ->`, error);
  }
};

connect();
