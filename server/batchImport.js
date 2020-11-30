"use strict";
const assert = require("assert");
// const fs = require("file-system");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// const seats = JSON.parse(fs.readFileSync());
const localSeats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    localSeats[`${row[r]}-${s}`] = {
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    };
  }
}

const seatsInDb = Object.values(localSeats);

const batchImport = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("ticket_booker");
    console.log("connected!");
    const result = await db.collection("seats").insertMany([...seatsInDb]);
    assert.strictEqual(seatsInDb.length, result.insertedCount);
    console.log("Seats added to the server!");
    client.close();
  } catch (err) {
    console.log(err.message);
  }
};

batchImport();
