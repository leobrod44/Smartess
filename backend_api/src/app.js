const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

//Add routes here
const testRoutes = require('./routes/testRoutes');

//add path here
app.use('/test1', testRoutes);
app.use('/test2', testRoutes);

module.exports = app;