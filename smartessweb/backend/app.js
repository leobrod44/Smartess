const express = require('express');
const cors = require('cors');
const logger = require('./backend-logs/logger');

const app = express();
app.use(cors());
app.use(express.json());

// initial server starting log
logger.info('Server is initializing...');

//Add routes here
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const startProjectRoutes = require('./routes/startProjectRoutes');
const userRoutes = require('./routes/userRoutes');

//Add path here
app.use('/api/auth', authRoutes);
app.use('/api', startProjectRoutes);
app.use('/test1', testRoutes);
app.use('/test2', testRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
