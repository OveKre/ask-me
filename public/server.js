const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const routes = require('./src/routes/index');

// Seadistused
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Marsruudid
app.use('/', routes);

// Serveri käivitamine
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server käivitatud pordil ${PORT}`);
});