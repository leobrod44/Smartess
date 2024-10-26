const { sendEmail, storeData } = require('../services/startProjectService');
require('dotenv').config();

exports.sendEmailController = async (req, res) => {
  const { businessName, firstName, lastName, telephoneNumber, email, description } = req.body;

  if ( !businessName || !firstName || !lastName || !telephoneNumber || !email || !description)
    return res.status(400).json({ message: 'All fields are required' });

  console.log(`Sending email to: ${email}...`);

  try {
    const result = await sendEmail(
      `Smartess <support@${process.env.RESEND_DOMAIN}>`,
      `${process.env.RESEND_EMAIL_TO}`,
      `Inquiry from ${firstName} ${lastName}`,
      `
        <h2>New Inquiry from ${businessName}</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Telephone Number:</strong> ${telephoneNumber}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Description:</strong> ${description}</p>
      `
    );

    if (result.success) {
      console.log('Email sent successfully');
      return res.status(200).json({
        message: 'Email sent successfully',
        data: result.data,
      });
    } else {
      console.log('Failed to send email');
      return res.status(500).json({
        message: 'Failed to send email',
        error: result.error,
      });
    }

  } catch (error) {
      return res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
  }
};

exports.storeDataController = async (req, res) => {
  const { businessName, firstName, lastName, telephoneNumber, email, description } = req.body;

  if ( !businessName || !firstName || !lastName || !telephoneNumber || !email || !description)
  return res.status(400).json({ message: 'All fields are required' });

  console.log(`Storing data for ${email} in database...`);

  try {
    const result = await storeData(businessName, firstName, lastName, telephoneNumber, email, description);

    if (result.success) {
      console.log('Email stored successfully');
      return res.status(200).json({ 
        message: 'Email stored successfully' 
      });
    } else {
      console.error('Failed to store data');
      return res.status(500).json({ 
        message: 'Failed to store data', 
        error: result.error 
      });
    }
  } catch (error) {
      return res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
  }
};