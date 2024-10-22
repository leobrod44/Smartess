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
const emailRoutes = require('./routes/emailRoutes');

//Add path here
app.use('/api/auth', authRoutes);
app.use('/api', emailRoutes);
app.use('/test1', testRoutes);
app.use('/test2', testRoutes);

module.exports = app;
