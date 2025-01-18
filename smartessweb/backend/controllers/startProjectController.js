require('dotenv').config();

const supabase = require('../config/supabase');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendEmail = async (req, res) => {
  const { businessName, firstName, lastName, telephoneNumber, email, description } = req.body;

  if ( !businessName || !firstName || !lastName || !telephoneNumber || !email)
    return res.status(400).json({ message: 'All fields are required' });

  console.log(`Sending email to: ${email}...`);

  try {
    const { data, error } = await resend.emails.send({
      from: `Smartess <support@${process.env.RESEND_DOMAIN}>`,
      to: `${process.env.RESEND_EMAIL_TO}`,
      subject: `Inquiry from ${firstName} ${lastName}`,
      html: 
      `
        <h2>New Inquiry from ${businessName}</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Telephone Number:</strong> ${telephoneNumber}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Description:</strong> ${description}</p>
      `
    });

    if (error) {
      console.log('Failed to send email');
      return res.status(500).json({
        message: 'Failed to send email',
        error
      });
    } else {
      console.log('Email sent successfully');
      return res.status(200).json({
        message: 'Email sent successfully',
        data
      });
    }
  } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({
        message: 'Server error sending email',
        error: error.message,
      });
  }
};

exports.storeData = async (req, res) => {
  const { businessName, firstName, lastName, telephoneNumber, email, description } = req.body;

  if ( !businessName || !firstName || !lastName || !telephoneNumber || !email)
  return res.status(400).json({ message: 'All fields are required' });

  console.log(`Storing data for ${email} in database...`);

  try {
    const { error } = await supabase
    .from('start_project')
    .insert([{
      business_name: businessName,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: telephoneNumber,
      description
    }]);

    if (error) {
      console.error('Failed to store data');
      return res.status(500).json({
        message: 'Failed to store data',
        error
      });
    } else {
        console.log('Data stored successfully');
        return res.status(200).json({
          message: 'Data stored successfully'
        });
    }
  } catch (error) {
      return res.status(500).json({
        message: 'Server error storing data',
        error: error.message,
      });
  }
};