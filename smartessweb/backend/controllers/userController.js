const supabase = require("../config/supabase");

exports.getUser = async (req, res) => {
  try {
    const token = req.token; // This comes from middleware

    // Get user email from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Query the user table using the email
    const { data: userData, error: dbError } = await supabase
      .from("user")
      .select("email, first_name, last_name, type")
      .eq("email", user.email)
      .single();

    if (dbError) {
      return res.status(500).json({ error: "Database query failed" });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      type: userData.type,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
