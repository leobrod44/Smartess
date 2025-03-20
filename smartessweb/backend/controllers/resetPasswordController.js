const supabase = require("../config/supabase");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { v4: uuidv4 } = require('uuid');

/**
 * Handles sending a password reset email to a user.
 * Uses Supabase's built-in password reset functionality.
 */
exports.sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Check if user exists in the user table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", email)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking existing user:", userCheckError);
      return res.status(500).json({ error: "Failed to check user existence." });
    }

    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate a token for tracking in our system
    const token = uuidv4();
    
    // Store token in temp_acc_access table
    const { error: insertError } = await supabase
      .from('temp_acc_access')
      .insert([{
        token_id: token,
        task: 'forgot-password',
        email: email
      }]);

    if (insertError) {
      console.error("Error storing token:", insertError);
      return res.status(500).json({ error: "Failed to create access token." });
    }

    const webURL = process.env.WEBSITE_URL;
    const resetLink = `${webURL}/resetPassword?token=${token}`;

    // HTML template for the email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Request</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            color: #333333;
            line-height: 1.6;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f8f9fa;
            padding: 20px 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: #4b7d8d;
            padding: 20px;
            text-align: center;
            color: #ffffff;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .email-body {
            padding: 20px;
            color: #333333;
          }
          .email-body p {
            margin: 10px 0;
          }
          .email-body .highlight {
            font-weight: bold;
            color: #4b7d8d;
          }
          .email-footer {
            text-align: center;
            padding: 10px;
            background-color: #1f505e;
            color: #ffffff;
            font-size: 12px;
          }
          .instructions {
            margin-top: 20px;
            padding: 15px;
            background-color: #e9f5f8;
            border-left: 4px solid #4b7d8d;
          }
          .reset-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #4b7d8d;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="email-body">
              <p>Hello,</p>
              <p>We received a request to reset your password for your Smartess account.</p>
              <div class="instructions">
                <p>Please click the button below to reset your password:</p>
                <a href="${resetLink}" class="reset-button">Reset Your Password</a>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
              </div>
            </div>
            <div class="email-footer">
              &copy; ${new Date().getFullYear()} Smartess. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    await resend.emails.send({
      from: `Smartess <support@${process.env.RESEND_DOMAIN}>`,
      to: email,
      subject: "Smartess Password Reset",
      html: htmlContent,
    });

    return res.status(200).json({
      message: "Password reset email sent successfully."
    });
  } catch (error) {
    console.error("Failed to process password reset:", error);
    return res.status(500).json({
      message: "Failed to process password reset request.",
      error: error.message
    });
  }
};

/**
 * Verifies a password reset token.
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Query temp_acc_access table to get email associated with token
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_acc_access")
      .select("email")
      .eq("token_id", token)
      .eq("task", "forgot-password")
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    // Return the email associated with the token
    return res.status(200).json({ 
      email: tokenData.email,
      message: "Token verified successfully" 
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates a user's password using a reset token.
 * Uses Supabase Auth's password update functionality.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, email } = req.body;

    if (!token || !password || !email) {
      return res.status(400).json({ error: "Token, password, and email are required" });
    }

    // Verify token is still valid
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_acc_access")
      .select("email")
      .eq("token_id", token)
      .eq("task", "forgot-password")
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (tokenData.email !== email) {
      return res.status(401).json({ error: "Token does not match the provided email" });
    }

    // Get admin client
    const supabaseAdmin = require('../config/supabase').admin;
    
    // Use the Supabase Auth API to get user info by email
    const { data: userList, error: userListError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userListError) {
      console.error("Error listing users:", userListError);
      return res.status(500).json({ error: "Failed to access user accounts" });
    }
    
    // Find the user with the matching email
    const user = userList.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userId = user.id;
    
    // Update user password using the userId
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Delete the used token
    await supabase
      .from("temp_acc_access")
      .delete()
      .eq("token_id", token);

    return res.status(200).json({ 
      message: "Password updated successfully. Please sign in." 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};