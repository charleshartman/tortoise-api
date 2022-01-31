// server.js <- adding mongodb

"use strict";

// Loads the configuration from config.env to process.env
require('dotenv').config({ path: './config.env' });

// get MongoDB driver connection
const dbo = require('./db/conn');

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

// mongodb additions
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

// Global error handling
app.use(function (err, _req, res) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// perform a database connection when the server starts
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  // app.listen(PORT, () => {
  //   console.log(`Server is running on port: ${PORT}`);
  // });

  app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening`);
  });
});

// Start server
// app.listen(process.env.PORT || 3002, () => {
//   console.log(`Server listening`);
// });
