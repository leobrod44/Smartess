const { createLogger, format, transports } = require('winston');
const path = require('path');

// timestamp format
const timestampFormat = format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss',
});

// custom print to txt file
const fileFormat = format.printf(({ timestamp, message }) => {
  return `${timestamp} - ${message}`; // Format for text file
});

// custom print to console
const consoleFormat = format.printf(({ timestamp, level, message }) => {
  return `${level}: ${timestamp} - ${message}`; // Format for console
});

// logger creation
const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: path.join(__dirname, 'backend-logs.txt'),
      format: format.combine(timestampFormat, fileFormat), // Format for file
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(), // Colorize level
        timestampFormat,
        consoleFormat // Format for console
      ),
    }),
  ],
});

// redirect console.log to Winston logger
console.log = (...args) => {
  logger.info(args.join(' '));
};

module.exports = logger;
