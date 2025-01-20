const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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

exports.getAllHubUserEmailsInOrg = async (req, res) => {
  try {
    const { orgId } = req.params;

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

    const projectIds = projects.map((p) => p.proj_id);

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

    const hubIds = hubs.map((h) => h.hub_id);

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

    const userIds = hubUsers.map((hu) => hu.user_id);

    const { data: users, error: userError } = await supabase
      .from("user")
      .select("user_id, email")
      .in("user_id", userIds);

    if (userError) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));

    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getAllHubUserEmailsInProject = async (req, res) => {
  try {
    const { projId } = req.params;

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

    const hubIds = hubs.map((h) => h.hub_id);

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

    const userIds = hubUsers.map((hu) => hu.user_id);

    const { data: users, error: userError } = await supabase
      .from("user")
      .select("email")
      .in("user_id", userIds);

    if (userError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch user information." });
    }

    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));

    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.sendAnnouncementEmail = async (req, res) => {
  try {
    const { emailList, type, selectedAddress, content } = req.body;
    const keywords = JSON.parse(req.body.keywords || "[]");
    const files = req.files;

    const subject = `Smartess Announcement: ${
      type === "organization" ? "Organization" : "Project"
    } Update`;

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

    const emailsToSend = JSON.parse(emailList);

    const attachments = (files || []).map((file) => {
      const filePath = path.resolve(file.path);
      const fileContent = fs.readFileSync(filePath);
      return {
        filename: file.originalname,
        content: fileContent.toString("base64"),
        contentType: file.mimetype,
      };
    });

    for (const email of emailsToSend) {
      await resend.emails.send({
        from: `Smartess <support@${process.env.RESEND_DOMAIN}>`,
        to: email,
        subject,
        html: htmlContent,
        attachments,
      });
    }

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

    return res.status(200).json({ message: "All emails sent successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to send emails.", error: error.message });
  }
};
