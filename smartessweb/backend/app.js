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
const projectRoutes = require('./routes/projectRoutes');
const hubRoutes = require('./routes/hubRoutes');
const widgetRoutes = require('./routes/widgetRoutes');

//Add path here
app.use('/api/auth', authRoutes);
app.use('/api', startProjectRoutes);
app.use('/test1', testRoutes);
app.use('/test2', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/widgets', widgetRoutes);

module.exports = app;
