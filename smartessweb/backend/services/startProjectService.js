require('dotenv').config();
const supabase = require('../config/supabase');
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

exports.storeData = async (businessName, firstName, lastName, telephoneNumber, email, description) => {
    try {
      const { data, error } = await supabase
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
        console.error('Error storing data:', error);
        return { success: false, error };
      }
  
      return { success: true, data };
    } catch (err) {
        console.error('Server error storing data:', err);
        return { success: false, error: err };
    }
  };