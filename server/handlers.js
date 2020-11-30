"use strict";
const assert = require("assert");
require("dotenv").config();
const { MONGO_URI } = process.env;
const { MongoClient } = require("mongodb");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ticket_booker");
    console.log("connected to Mongo!");
    const seats = await db.collection("seats").find().toArray();

    const newSeats = {};
    seats.forEach((seat) => {
      newSeats[seat._id] = { price: seat.price, isBooked: seat.isBooked };
    });

    res
      .status(200)
      .json({ status: 200, seats: newSeats, numOfRows: 8, seatsPerRow: 12 });
  } catch (err) {
    res.status(400).json({ status: 400, message: err, data: " Not found 🤷‍♂️ " });
  }
  client.close();
};

// ******************

const bookSeat = async (req, res) => {
  const { seatId, creditCard, fullName, expiration, email } = req.body;
  const _id = seatId;
  const bookingInfo = {
    $set: { isBooked: true, fullName, email },
  };
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ticket_booker");
    console.log("connected to Mongo!");

    const isAlreadyBooked = false;
    const bookingAttempt = await db
      .collection("seats")
      .findOne({ _id }, (err, result) => {
        if (err) {
          throw err;
        }
        if (result.isBooked) {
          isAlreadyBooked = true;
        }
      });

    if (isAlreadyBooked) {
      res
        .status(404)
        .json({ status: 400, message: `Seat ${_id} is already booked !` });
      client.close();
      return;
    }

    const response = await db
      .collection("seats")
      .updateOne({ _id }, bookingInfo);
    assert.strictEqual(1, response.matchedCount);
    assert.strictEqual(1, response.ModifiedCount);

    res.status(200).json({
      status: 200,
      seat: _id,
      fullName,
      email,
      message: `Your Seat ${_id} has been booked! `,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
  client.close();
};

module.exports = { getSeats, bookSeat };
