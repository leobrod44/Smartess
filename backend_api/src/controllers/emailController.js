const { sendEmail } = require('../services/emailService');

exports.sendEmailController = async (req, res) => {
  const {
    businessName,
    firstName,
    lastName,
    telephoneNumber,
    email,
    description,
  } = req.body;

  if (
    !businessName ||
    !firstName ||
    !lastName ||
    !telephoneNumber ||
    !email ||
    !description
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await sendEmail(
      'Smartess <onboarding@resend.dev>',
      '1tuananhp@gmail.com',
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
      return res.status(200).json({
        message: 'Email sent successfully',
        data: result.data,
      });
    }

    return res.status(500).json({
      message: 'Failed to send email',
      error: result.error,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
