const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET /get_announcements/:userId
 * Fetches announcements that the given user can see based on:
 * 1) The organizations they belong to (type: 'organization')
 * 2) The projects they manage (type: 'project')
 */
exports.getAnnouncements = async (req, res) => {
  try {
    // Extract userId from URL params
    const { userId } = req.params;

    // 1) Check if the user exists by userId
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (userError) {
      console.error("User Error:", userError);
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentUserId = userData.user_id;

    // 2) Get all org_id and proj_id entries from org_user where user_id = currentUserId
    const { data: orgUserData, error: orgUserError } = await supabase
      .from("org_user")
      .select("org_id, proj_id")
      .eq("user_id", currentUserId);

    if (orgUserError) {
      console.error("org_user Error:", orgUserError);
      return res.status(500).json({ error: "Failed to fetch org_user data." });
    }

    // Collect all org IDs and project IDs this user is associated with
    const userOrgIds = [
      ...new Set(orgUserData.map((item) => item.org_id).filter(Boolean)),
    ];
    const userProjIds = [
      ...new Set(orgUserData.map((item) => item.proj_id).filter(Boolean)),
    ];

    // 3) Fetch organization-level announcements
    let announcementsOrg = [];
    if (userOrgIds.length > 0) {
      const { data, error } = await supabase
        .from("announcements")
        .select(
          `
          announcement_id,
          announcement_type,
          user_id,
          org_id,
          proj_id,
          content,
          keywords,
          file_urls,
          like_count,
          created_at,
          user:user_id (
            first_name,
            last_name,
            profile_picture_url
          ),
          organization:org_id (
            name
          ),
          project:proj_id (
            address
          )
        `
        )
        .eq("announcement_type", "organization") // or 'organization'
        .in("org_id", userOrgIds);

      if (error) {
        console.error("Announcements Org Error:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch organization announcements." });
      }
      announcementsOrg = data || [];
    }

    // 4) Fetch project-level announcements
    let announcementsProj = [];
    if (userProjIds.length > 0) {
      const { data, error } = await supabase
        .from("announcements")
        .select(
          `
          announcement_id,
          announcement_type,
          user_id,
          org_id,
          proj_id,
          content,
          keywords,
          file_urls,
          like_count,
          created_at,
          user:user_id (
            first_name,
            last_name,
            profile_picture_url
          ),
          organization:org_id (
            name
          ),
          project:proj_id (
            address
          )
        `
        )
        .eq("announcement_type", "project") // or 'project'
        .in("proj_id", userProjIds);

      if (error) {
        console.error("Announcements Proj Error:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch project announcements." });
      }
      announcementsProj = data || [];
    }

    // 5) Combine both sets of announcements
    const allAnnouncements = [...announcementsOrg, ...announcementsProj];

    // 6) Format them in the desired shape
    const formatted = allAnnouncements.map((ann) => {
      const fullName = ann.user
        ? `${ann.user.first_name ?? ""} ${ann.user.last_name ?? ""}`.trim()
        : null;

      let newCreatedAt = null;
      if (ann.created_at) {
        const date = new Date(ann.created_at);
        date.setDate(date.getDate() + 1); // Add one day
        newCreatedAt = date.toISOString().split("T")[0];
      }

      return {
        announcement_id: ann.announcement_id,
        announcement_type: ann.announcement_type,
        user_id: ann.user_id,
        user_profile_picture: ann.user?.profile_picture_url || null,
        name: fullName,
        org_id: ann.org_id || null,
        org_name: ann.organization ? ann.organization.name : null,
        proj_id: ann.proj_id || null,
        address: ann.project ? ann.project.address : null,
        content: ann.content,
        keywords: ann.keywords || [],
        file_urls: ann.file_urls || [],
        like_count: ann.like_count || 0,
        // Format created_at to YYYY-MM-DD or keep the original timestamp if desired
        created_at: newCreatedAt,
      };
    });

    // 7) Return the results
    return res.json({ announcements: formatted });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

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

    const files = req.files || [];
    const fileUrls = [];

    // Upload files to Supabase and get public URLs
    for (const file of files) {
      const filePath = path.resolve(file.path);
      const ext = path.extname(file.originalname);
      const uniqueFileName = `${uuidv4()}${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("announcement_uploads")
        .upload(`announcements/${uniqueFileName}`, fs.readFileSync(filePath), {
          contentType: file.mimetype,
        });

      fs.unlinkSync(filePath);

      if (uploadError) {
        console.error("Error uploading to Supabase Storage:", uploadError);
        return res
          .status(500)
          .json({ message: "File upload error", error: uploadError });
      }

      const { data: publicUrlData } = supabase.storage
        .from("announcement_uploads")
        .getPublicUrl(`announcements/${uniqueFileName}`);
      const publicUrl = publicUrlData?.publicUrl;

      fileUrls.push(publicUrl);
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("announcements")
      .insert([
        {
          announcement_type: type,
          user_id,
          org_id: org_id || null,
          proj_id: proj_id || null,
          content,
          keywords: keywords || [],
          file_urls: fileUrls,
        },
      ])
      .select(
        `
        announcement_id,
        announcement_type,
        user_id,
        org_id,
        proj_id,
        content,
        keywords,
        file_urls,
        like_count,
        created_at,
        user:user_id (
          first_name,
          last_name
        ),
        organization:org_id (
          name
        ),
        project:proj_id (
          address
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Insert Error:", insertError);
      return res
        .status(500)
        .json({ message: "Failed to store data", error: insertError });
    }

    const insertedAnnouncement = {
      announcement_id: insertedData.announcement_id,
      announcement_type: insertedData.announcement_type,
      user_id: insertedData.user_id,
      name: `${insertedData.user.first_name ?? ""} ${
        insertedData.user.last_name ?? ""
      }`.trim(),
      org_id: insertedData.org_id || null,
      org_name: insertedData.organization
        ? insertedData.organization.name
        : null,
      proj_id: insertedData.proj_id || null,
      address: insertedData.project ? insertedData.project.address : null,
      content: insertedData.content,
      keywords: insertedData.keywords || [],
      file_urls: insertedData.file_urls || [],
      like_count: insertedData.like_count || 0,
      created_at: insertedData.created_at
        ? insertedData.created_at.split("T")[0]
        : null,
    };

    // Return as an array to match `AnnouncementsData`
    return res.status(200).json({ announcements: [insertedAnnouncement] });
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
