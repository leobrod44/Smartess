const supabase = require("../config/supabase");
const supabaseAdmin = require("../config/supabase").admin;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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
      .select("user_id, email, first_name, last_name, type")
      .eq("email", user.email)
      .single();

    if (dbError) {
      return res.status(500).json({ error: "Database query failed" });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user_id: userData.user_id,
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

exports.storeProfilePicture = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: userData, error: dbError } = await supabase
      .from("user")
      .select("user_id, email, first_name, last_name, type")
      .eq("email", user.email)
      .single();

    if (dbError) {
      return res.status(500).json({ error: "Database query failed" });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Use req.file since upload.single("file") is used.
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const file = req.file;
    const filePath = path.resolve(file.path);
    const ext = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${ext}`;

    // Upload file to the "avatars" bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(`users/${uniqueFileName}`, fs.readFileSync(filePath), {
        contentType: file.mimetype,
      });

    // Remove temporary uploaded file from server only if the upload was successful
    fs.unlinkSync(filePath);

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError);
      return res
        .status(500)
        .json({ message: "File upload error", error: uploadError });
    }

    // ✅ Retrieve the public URL from the same bucket, using `supabaseAdmin`
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(`users/${uniqueFileName}`);

    const publicUrl = publicUrlData?.publicUrl || null;

    if (!publicUrl) {
      console.error("Error retrieving public URL.");
      return res
        .status(500)
        .json({ message: "Failed to retrieve public URL." });
    }

    // ✅ Update the user's record with the new profile picture URL
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("user")
      .update({ profile_picture_url: publicUrl })
      .eq("user_id", userData.user_id)
      .select()
      .single();

    if (updateError) {
      console.error("Update Error:", updateError);
      return res
        .status(500)
        .json({ message: "Failed to update user", error: updateError });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      message: "Server error storing profile picture",
      error: error.message,
    });
  }
};
