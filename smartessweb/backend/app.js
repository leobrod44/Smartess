const express = require('express');
const cors = require('cors');
const logger = require('./backend-logs/logger');

const app = express();
app.use(cors());
app.use(express.json());

// initial server starting log
logger.info('Server is initializing...');

//Add routes here
const authRoutes = require('./routes/authRoutes');
const startProjectRoutes = require('./routes/startProjectRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const hubRoutes = require('./routes/hubRoutes');
const widgetRoutes = require('./routes/widgetRoutes');
const manageAccountsRoutes = require('./routes/manageAccountsRoutes');
const unitsRoutes = require('./routes/unitsRoutes');

//Add path here
app.use('/api/auth', authRoutes);
app.use('/api', startProjectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/manage-accounts', manageAccountsRoutes);
app.use('/api/units', unitsRoutes);

module.exports = app;
