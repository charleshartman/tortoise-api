// index.js

"use strict";

require('dotenv').config({ path: './config.env' });
const { MongoClient } = require("mongodb");
const connectionString = process.env.ATLAS_URI;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool } = require('./config');


const app = express();
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// for MongoDB
app.use(express.json());
app.use(require('./routes/record'));

const getBooks = (request, response) => {
  pool.query('SELECT * FROM books', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addBook = (request, response) => {
  const { author, title } = request.body;

  pool.query(
    'INSERT INTO books (author, title) VALUES ($1, $2)',
    [author, title],
    (error) => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'success', message: 'Book added.' });
    }
  );
};

const getHome = (request, response) => {
  response.sendFile(__dirname + '/public/index.html');
};

app
  .route('/')
  .get(getHome);

app
  .route('/books')
  // GET endpoint
  .get(getBooks)
  // POST endpoint
  .post(addBook);

let dbConnection;

const connectToServer = function(callback) {
  client.connect(function (err, db) {
    if (err || !db) {
      return callback(err);
    }

    dbConnection = db.db("phonebook-app");
    console.log("Successfully connected to MongoDB.");

    return callback();
  });
};

const getDb = () => dbConnection;

const recordRoutes = express.Router();


// This section will help you get a list of all the records.
recordRoutes.route('/contacts').get(async function (_req, res) {
  const dbConnect = getDb();

  dbConnect
    .collection('people')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json(result);
      }
    });
});

// perform a database connection when the server starts
connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening, MongoDB connection up`);
  });
});

// Start server
// app.listen(process.env.PORT || 3002, () => {
//   console.log(`Server listening`);
// });
