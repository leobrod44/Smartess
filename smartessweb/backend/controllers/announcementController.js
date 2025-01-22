const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * This route stores an announcement in the database along with any uploaded files.
 * - Uploads files to Supabase Storage
 * - Inserts announcement data into the "announcements" table (including file URLs)
 */
exports.storeAnnouncement = async (req, res) => {
  try {
    const { type, user_id, org_id, proj_id, content } = req.body;
    let { keywords } = req.body;

    // Parse keywords if they come in as a JSON string
    if (typeof keywords === "string") {
      keywords = JSON.parse(keywords);
    }

    // Handle attached files (via Multer)
    const files = req.files || [];
    const fileUrls = [];

    // Upload each file to Supabase, generate a public URL, and store it
    for (const file of files) {
      const filePath = path.resolve(file.path);
      const ext = path.extname(file.originalname);
      const uniqueFileName = `${uuidv4()}${ext}`;

      // Upload file to the "announcement_uploads" bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("announcement_uploads")
        .upload(`announcements/${uniqueFileName}`, fs.readFileSync(filePath), {
          contentType: file.mimetype,
        });

      // Delete local file after upload
      fs.unlinkSync(filePath);

      if (uploadError) {
        console.error("Error uploading to Supabase Storage:", uploadError);
        return res
          .status(500)
          .json({ message: "File upload error", error: uploadError });
      }

      // Retrieve the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("announcement_uploads")
        .getPublicUrl(`announcements/${uniqueFileName}`);
      const publicUrl = publicUrlData?.publicUrl;

      fileUrls.push(publicUrl);
    }

    // Insert the announcement record into the database
    const { error: insertError } = await supabase.from("announcements").insert([
      {
        announcement_type: type,
        user_id,
        org_id: org_id || null,
        proj_id: proj_id || null,
        content,
        keywords: keywords || [],
        file_urls: fileUrls,
      },
    ]);

    if (insertError) {
      console.error("Insert Error:", insertError);
      return res
        .status(500)
        .json({ message: "Failed to store data", error: insertError });
    }

    console.log("Data stored successfully");
    return res.status(200).json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("Server Error:", error);
    return res
      .status(500)
      .json({ message: "Server error storing data", error: error.message });
  }
};

/**
 * This route retrieves the organization ID a user belongs to, from the "org_user" table.
 */
exports.getCurrentUserOrgId = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("org_user")
      .select("org_id")
      .eq("user_id", userId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching organization ID", error });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found in any organization" });
    }

    const orgId = data[0].org_id;
    return res.status(200).json({ orgId });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * This route retrieves a list of user emails in an organization's hubs (via its projects).
 * - Finds projects for the org
 * - Finds hubs for those projects
 * - Looks up users assigned to those hubs
 * - Returns their unique email addresses
 */
exports.getAllHubUserEmailsInOrg = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Get all projects for the organization
    const { data: projects, error: projectError } = await supabase
      .from("project")
      .select("proj_id")
      .eq("org_id", orgId);

    if (projectError) {
      return res.status(500).json({ error: "Failed to fetch projects." });
    }

    if (!projects || projects.length === 0) {
      return res.json({ emails: [] });
    }

    // Extract project IDs
    const projectIds = projects.map((p) => p.proj_id);

    // Get hubs that belong to those projects
    const { data: hubs, error: hubError } = await supabase
      .from("hub")
      .select("hub_id")
      .in("proj_id", projectIds);

    if (hubError) {
      return res.status(500).json({ error: "Failed to fetch hubs." });
    }

    if (!hubs || hubs.length === 0) {
      return res.json({ emails: [] });
    }

    // Extract hub IDs
    const hubIds = hubs.map((h) => h.hub_id);

    // Get users in those hubs
    const { data: hubUsers, error: hubUserError } = await supabase
      .from("hub_user")
      .select("user_id")
      .in("hub_id", hubIds);

    if (hubUserError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch hub_user entries." });
    }

    if (!hubUsers || hubUsers.length === 0) {
      return res.json({ emails: [] });
    }

    // Extract user IDs
    const userIds = hubUsers.map((hu) => hu.user_id);

    // Retrieve user emails from the "user" table
    const { data: users, error: userError } = await supabase
      .from("user")
      .select("user_id, email")
      .in("user_id", userIds);

    if (userError) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    // Make sure emails are unique
    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));
    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * This route retrieves a list of user emails in a specific project's hubs.
 * - Finds all hubs for that project
 * - Looks up users in those hubs
 * - Returns a unique list of their emails
 */
exports.getAllHubUserEmailsInProject = async (req, res) => {
  try {
    const { projId } = req.params;

    // Get all hubs for the given project
    const { data: hubs, error: hubError } = await supabase
      .from("hub")
      .select("hub_id")
      .eq("proj_id", projId);

    if (hubError) {
      return res.status(500).json({ error: "Failed to fetch hubs." });
    }

    if (!hubs || hubs.length === 0) {
      return res.json({ emails: [] });
    }

    // Extract hub IDs
    const hubIds = hubs.map((h) => h.hub_id);

    // Find users assigned to these hubs
    const { data: hubUsers, error: hubUserError } = await supabase
      .from("hub_user")
      .select("user_id")
      .in("hub_id", hubIds);

    if (hubUserError) {
      return res.status(500).json({ error: "Failed to fetch hub_user data." });
    }

    if (!hubUsers || hubUsers.length === 0) {
      return res.json({ emails: [] });
    }

    // Extract user IDs
    const userIds = hubUsers.map((hu) => hu.user_id);

    // Retrieve corresponding user emails
    const { data: users, error: userError } = await supabase
      .from("user")
      .select("email")
      .in("user_id", userIds);

    if (userError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch user information." });
    }

    // Deduplicate emails
    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));
    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * This route sends out an announcement email (with optional file attachments) to a list of recipients.
 * - Builds an HTML email using the provided content
 * - Attaches files if any
 * - Sends the email via Resend API
 */
exports.sendAnnouncementEmail = async (req, res) => {
  try {
    const { emailList, type, selectedAddress, content } = req.body;
    const keywords = JSON.parse(req.body.keywords || "[]");
    const files = req.files;

    const subject = `Smartess Announcement: ${
      type === "organization" ? "Organization" : "Project"
    } Update`;

    // Simple HTML template for the email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smartess Announcement</title>
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
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>${
                type === "organization" ? "Organization" : "Project"
              } Announcement</h1>
            </div>
            <div class="email-body">
              <p>${content}</p>
              ${
                type === "project" && selectedAddress
                  ? `<p><span class="highlight">Selected Address:</span> ${selectedAddress}</p>`
                  : ""
              }
              ${
                keywords.length > 0
                  ? `<p><span class="highlight">Keywords:</span> ${keywords.join(
                      ", "
                    )}</p>`
                  : ""
              }
            </div>
            <div class="email-footer">
              &copy; ${new Date().getFullYear()} Smartess. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Convert the emailList from a JSON string to an array
    const emailsToSend = JSON.parse(emailList);

    // Prepare attachments (base64-encode the file content)
    const attachments = (files || []).map((file) => {
      const filePath = path.resolve(file.path);
      const fileContent = fs.readFileSync(filePath);
      return {
        filename: file.originalname,
        content: fileContent.toString("base64"),
        contentType: file.mimetype,
      };
    });

    // Send the email to each address in the list using Resend
    for (const email of emailsToSend) {
      await resend.emails.send({
        from: `Smartess <support@${process.env.RESEND_DOMAIN}>`,
        to: email,
        subject,
        html: htmlContent,
        attachments,
      });
    }

    // Clean up temporary files on the server
    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = path.resolve(file.path);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }

    // Send a success response
    return res.status(200).json({ message: "All emails sent successfully." });
  } catch (error) {
    console.error("Failed to send emails:", error);
    return res
      .status(500)
      .json({ message: "Failed to send emails.", error: error.message });
  }
};
