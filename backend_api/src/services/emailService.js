require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendEmail = async (from, to, subject, htmlContent) => {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Server error sending email:', err);
    return { success: false, error: err };
  }
};
