const supabase = require("../config/supabase");

exports.verifyRegistrationToken = async (req, res) => {
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
      .eq("task", "registration")
      .single();

    if (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(500).json({ error: "Failed to verify token" });
    }

    if (!tokenData) {
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

exports.register = async (req, res) => {
  try {
    const { token, firstName, lastName, phone, password, email } = req.body;

    if (!token || !firstName || !lastName || !phone || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Verify token is still valid
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_acc_access")
      .select("email")
      .eq("token_id", token)
      .eq("task", "registration")
      .single();

    if (tokenError || !tokenData || tokenData.email !== email) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Create user with normal signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return res.status(500).json({ error: "Failed to create authentication" });
    }

    // Update user info in user table
    const { error: updateError } = await supabase
      .from("user")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      })
      .eq("email", email);

    if (updateError) {
      console.error("Update Error:", updateError);
      return res.status(500).json({ error: "Failed to update user information" });
    }

    // Delete the used token
    await supabase
      .from("temp_acc_access")
      .delete()
      .eq("token_id", token);

    return res.status(200).json({ 
      message: "Registration successful. Please sign in." 
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};