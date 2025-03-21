const supabase = require("../config/supabase");
const supabaseAdmin = require("../config/supabase").admin;
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: userData, error: userError } = await supabase
      .from("user")
      .select(
        "user_id, email, first_name, last_name, phone_number, profile_picture_url"
      )
      .eq("email", user.email)
      .single();

    if (userError) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    const { data: currentUser, error: currentUserError } = await supabase
      .from("org_user")
      .select("user_id, proj_id, org_id, org_user_type")
      .eq("user_id", userData.user_id);

    if (currentUserError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch current user data." });
    }

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found." });
    }

    const projectIds = currentUser.map((cUser) => cUser.proj_id);
    const { data: projects, error: projectError } = await supabase
      .from("project")
      .select("address")
      .in("proj_id", projectIds);

    if (projectError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch project addresses." });
    }

    const addresses = projects.map((project) => project.address);
    const role = currentUser[0].org_user_type;

    const formattedCurrentUser = {
      userId: userData.user_id,
      role:
        role === "master" || role === "admin" || role === "basic"
          ? role
          : "basic",
      address: addresses,
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      phoneNumber: userData.phone_number,
      profilePictureUrl: userData.profile_picture_url,
    };

    res.json({ currentUser: formattedCurrentUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token or user not found" });
    }

    const { email, firstName, lastName, phoneNumber } = req.body;

    if (email) {
      const { data: updatedAuthUser, error: authUpdateError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email: email,
        });

      if (authUpdateError) {
        console.error(
          "Error updating Supabase Auth user email:",
          authUpdateError
        );
        return res
          .status(500)
          .json({ error: "Failed to update Auth user email" });
      }
    }

    const updateFields = {};
    if (email) updateFields.email = email;
    if (firstName) updateFields.first_name = firstName;
    if (lastName) updateFields.last_name = lastName;
    if (phoneNumber) updateFields.phone_number = phoneNumber;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("user")
      .update(updateFields)
      .eq("email", user.email)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user info in DB:", updateError);
      return res.status(500).json({ error: "Failed to update user info" });
    }

    const formattedUser = {
      ...updatedUser,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phoneNumber: updatedUser.phone_number,
    };

    return res.status(200).json({ user: formattedUser });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
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

    // Retrieve the public URL from the same bucket, using `supabaseAdmin`
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

    // Update the user's record with the new profile picture URL
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

    return res.status(200).json({ profilePictureUrl: publicUrl });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      message: "Server error storing profile picture",
      error: error.message,
    });
  }
};

exports.getOrgUsers = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    const { data: orgUserData, error: orgUserError } = await supabase
      .from("org_user")
      .select("org_id, proj_id")
      .eq("user_id", userData.user_id);

    if (orgUserError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch organization data." });
    }

    // get all organizations and projects for the current user
    const orgIds = [...new Set(orgUserData.map((org) => org.org_id))]; // Unique org_ids
    const projIds = [...new Set(orgUserData.map((proj) => proj.proj_id))];
    if (orgIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No organizations found for this user." });
    }

    const { data: nonNullProjData, error: nonNullProjError } = await supabase
      .from("org_user")
      .select("user_id, org_id, proj_id, org_user_type")
      .in("org_id", orgIds)
      .in("proj_id", projIds)
      .neq("user_id", userData.user_id);

    // Query for when proj_id is null
    const { data: nullProjData, error: nullProjError } = await supabase
      .from("org_user")
      .select("user_id, org_id, proj_id, org_user_type")
      .in("org_id", orgIds)
      .is("proj_id", null) // Check specifically for null
      .neq("user_id", userData.user_id);

    // Combine the results
    const allOrgUsers = [...nonNullProjData, ...nullProjData];

    if (nonNullProjError || nullProjError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch organization users." });
    }

    res.json({ orgUsers: allOrgUsers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getOrgIndividualsData = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { fetchedOrgUsers } = req.body;

    if (!fetchedOrgUsers || fetchedOrgUsers.length === 0) {
      return res.status(400).json({ error: "No organization users provided." });
    }

    const userIds = fetchedOrgUsers.map((user) => user.user_id);

    const { data: individualData, error: fetchError } = await supabase
      .from("user")
      .select("user_id, first_name, last_name, profile_picture_url")
      .in("user_id", userIds);

    if (fetchError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch individual data." });
    }

    if (!individualData || individualData.length === 0) {
      return res
        .status(404)
        .json({ error: "No individuals found for the provided user IDs." });
    }

    const individuals = individualData.map((user) => {
      const orgUser = fetchedOrgUsers.find(
        (org) => org.user_id === user.user_id
      );

      return {
        individualId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: orgUser?.org_user_type || "basic", // default to basic if no role is found
        profilePictureUrl: user.profile_picture_url,
      };
    });

    res.json({ individuals: individuals });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getOrgUsersProjects = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { fetchedOrgUsers } = req.body;

    if (!fetchedOrgUsers || fetchedOrgUsers.length === 0) {
      return res.status(400).json({ error: "No organization users provided." });
    }

    const uniqueProjIds = [
      ...new Set(fetchedOrgUsers.map((user) => user.proj_id)),
    ].filter((id) => id !== null);

    const { data: projectData, error: queryError } = await supabase
      .from("project")
      .select(
        "proj_id, address, admin_users_count, hub_users_count, pending_tickets_count"
      )
      .in("proj_id", uniqueProjIds);

    if (queryError) {
      console.error("Query Error:", queryError);
      return res.status(500).json({ error: "Failed to fetch projects." });
    }

    if (!projectData || projectData.length === 0) {
      return res
        .status(404)
        .json({ error: "No projects found for the provided IDs." });
    }

    const projects = projectData.map((project) => ({
      projectId: project.proj_id.toString(),
      address: project.address,
      adminUsersCount: project.admin_users_count,
      hubUsersCount: project.hub_users_count,
      pendingTicketsCount: project.pending_tickets_count,
    }));

    res.json({ projects: projects });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getOrgProjects = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { currentOrg } = req.body;

    if (!currentOrg) {
      return res
        .status(400)
        .json({ error: "Organization ID (org_id) is required." });
    }

    const { data: projectData, error: queryError } = await supabase
      .from("project")
      .select(
        "proj_id, address, admin_users_count, hub_users_count, pending_tickets_count"
      )
      .eq("org_id", currentOrg);

    if (queryError) {
      console.error("Query Error:", queryError);
      return res.status(500).json({ error: "Failed to fetch projects." });
    }

    if (!projectData || projectData.length === 0) {
      return res
        .status(404)
        .json({ error: "No projects found for the provided organization ID." });
    }

    const projects = projectData.map((project) => ({
      projectId: project.proj_id.toString(),
      address: project.address,
      adminUsersCount: project.admin_users_count,
      hubUsersCount: project.hub_users_count,
      pendingTicketsCount: project.pending_tickets_count,
    }));

    res.json({ orgProjects: projects });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.assignOrgUserToProject = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { user_id, org_id, proj_ids, org_user_type } = req.body;

    if (
      !user_id ||
      !org_id ||
      !proj_ids ||
      !Array.isArray(proj_ids) ||
      !org_user_type
    ) {
      return res.status(400).json({
        error:
          "user_id, org_id, proj_ids (array), and org_user_type are required.",
      });
    }

    // Check the number of rows for this user and org
    const { data: rows, error: fetchError } = await supabase
      .from("org_user")
      .select("*")
      .eq("user_id", user_id)
      .eq("org_id", org_id);

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch org_user data." });
    }

    if (rows.length === 1) {
      // if the org user is assigned to no projects
      if (rows[0].proj_id === null) {
        // If only one row exists, update its proj_id with the first element of proj_ids
        const firstProjId = proj_ids[0];

        const { data: project, error: fetchProjectError } = await supabase
          .from("project")
          .select("admin_users_count")
          .eq("proj_id", firstProjId)
          .single();

        if (!fetchProjectError && project) {
          const newCount = (project.admin_users_count || 0) + 1;
          await supabase
            .from("project")
            .update({ admin_users_count: newCount })
            .eq("proj_id", firstProjId);
        }

        const { error: updateError } = await supabase
          .from("org_user")
          .update({ proj_id: firstProjId })
          .eq("user_id", user_id)
          .eq("org_id", org_id);

        if (updateError) {
          console.error("Update Error:", updateError);
          return res
            .status(500)
            .json({ error: "Failed to update existing org_user row." });
        }

        // If there are more proj_ids, insert new rows for the rest
        if (proj_ids.length > 1) {
          const additionalProjIds = proj_ids.slice(1);

          const insertPromises = additionalProjIds.map(async (proj_id) => {
            const { data: project, error: fetchProjectError } = await supabase
              .from("project")
              .select("admin_users_count")
              .eq("proj_id", proj_id)
              .single();

            if (!fetchProjectError && project) {
              const newCount = (project.admin_users_count || 0) + 1;
              await supabase
                .from("project")
                .update({ admin_users_count: newCount })
                .eq("proj_id", proj_id);
            }

            return supabase.from("org_user").insert([
              {
                user_id,
                org_id,
                proj_id,
                org_user_type,
              },
            ]);
          });

          const results = await Promise.all(insertPromises);

          const insertError = results.find((result) => result.error);
          if (insertError) {
            console.error("Insert Error:", insertError.error);
            return res.status(500).json({
              error: "Failed to assign user to additional project(s).",
            });
          }
        }

        return res.status(200).json({
          message:
            "User successfully updated and assigned to additional project(s) if applicable.",
        });
      }
    }

    // If more than one row exists, proceed with inserting new rows
    const insertPromises = proj_ids.map(async (proj_id) => {
      const { data: project, error: fetchProjectError } = await supabase
        .from("project")
        .select("admin_users_count")
        .eq("proj_id", proj_id)
        .single();

      if (!fetchProjectError && project) {
        const newCount = (project.admin_users_count || 0) + 1;
        await supabase
          .from("project")
          .update({ admin_users_count: newCount })
          .eq("proj_id", proj_id);
      }

      return supabase.from("org_user").insert([
        {
          user_id,
          org_id,
          proj_id,
          org_user_type,
        },
      ]);
    });

    const results = await Promise.all(insertPromises);

    const insertError = results.find((result) => result.error);
    if (insertError) {
      console.error("Insert Error:", insertError.error);
      return res
        .status(500)
        .json({ error: "Failed to assign user to project(s)." });
    }

    res
      .status(200)
      .json({ message: "User successfully assigned to project(s)." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.removeOrgUserFromProject = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { user_id, org_id, proj_ids } = req.body;

    if (!user_id || !org_id || !proj_ids || !Array.isArray(proj_ids)) {
      return res
        .status(400)
        .json({ error: "user_id, org_id, and proj_ids (array) are required." });
    }

    // fetch the user's type from the user table
    const { data: userData, error: fetchUserError } = await supabase
      .from("user")
      .select("type")
      .eq("user_id", user_id)
      .single();

    if (fetchUserError || !userData) {
      console.error("Fetch User Error:", fetchUserError);
      return res.status(500).json({ error: "Failed to fetch user type." });
    }

    const user_type = userData.type;

    // Check the number of rows left for this user and org
    const { data: rows, error: fetchError } = await supabase
      .from("org_user")
      .select("*")
      .eq("user_id", user_id)
      .eq("org_id", org_id);

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch org_user data." });
    }

    const totalRows = rows.length;

    if (totalRows === proj_ids.length) {
      // Fetch all projects associated with proj_ids
      const updateCountsPromises = proj_ids.map(async (proj_id) => {
        const { data: project, error: fetchProjectError } = await supabase
          .from("project")
          .select("admin_users_count")
          .eq("proj_id", proj_id)
          .single();

        if (!fetchProjectError && project) {
          const newCount = Math.max((project.admin_users_count || 0) - 1, 0);
          await supabase
            .from("project")
            .update({ admin_users_count: newCount })
            .eq("proj_id", proj_id);
        }
      });

      await Promise.all(updateCountsPromises); // Wait for all updates

      // Now delete all but one row
      const rowToKeep = rows[0];

      if (!rowToKeep) {
        return res.status(400).json({ error: "Invalid proj_ids provided." });
      }

      const deletePromises = proj_ids
        .filter((proj_id) => proj_id !== rowToKeep.proj_id)
        .map((proj_id) => {
          return supabase
            .from("org_user")
            .delete()
            .eq("user_id", user_id)
            .eq("org_id", org_id)
            .eq("proj_id", proj_id);
        });

      const deleteResults = await Promise.all(deletePromises);
      const deleteError = deleteResults.find((result) => result.error);

      if (deleteError) {
        console.error("Delete Error:", deleteError.error);
        return res
          .status(500)
          .json({ error: "Failed to remove user from project(s)." });
      }

      // Finally, update the remaining row
      const { error: updateError } = await supabase
        .from("org_user")
        .update({ proj_id: null })
        .eq("user_id", user_id)
        .eq("org_id", org_id)
        .eq("proj_id", rowToKeep.proj_id);

      if (updateError) {
        console.error("Update Error:", updateError);
        return res.status(500).json({
          error: "Failed to update remaining org_user proj_id to null.",
        });
      }

      return res.status(200).json({
        message:
          "User successfully removed from projects and last proj_id set to null.",
      });
    }

    // Delete only the provided proj_ids
    const deletePromises = proj_ids.map(async (proj_id) => {
      const { data: project, error: fetchProjectError } = await supabase
        .from("project")
        .select("admin_users_count")
        .eq("proj_id", proj_id)
        .single();

      if (!fetchProjectError && project) {
        const newCount = (project.admin_users_count || 0) - 1;
        await supabase
          .from("project")
          .update({ admin_users_count: newCount })
          .eq("proj_id", proj_id);
      }

      return supabase
        .from("org_user")
        .delete()
        .eq("user_id", user_id)
        .eq("org_id", org_id)
        .eq("proj_id", proj_id);
    });

    const results = await Promise.all(deletePromises);

    const deleteError = results.find((result) => result.error);
    if (deleteError) {
      console.error("Delete Error:", deleteError.error);
      return res
        .status(500)
        .json({ error: "Failed to remove user from project(s)." });
    }

    res
      .status(200)
      .json({ message: "User successfully removed from project(s)." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteOrgUser = async (req, res) => {
  try {
    // 1) Validate the token
    const token = req.token;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2) Get the request body
    const { user_id, org_id } = req.body;
    if (!user_id || !org_id) {
      return res.status(400).json({
        error: "user_id and org_id are required.",
      });
    }

    // 3) Fetch the user info from your "user" table (grab the email + type, etc.)
    const { data: userData, error: fetchUserError } = await supabase
      .from("user")
      .select("email, type")
      .eq("user_id", user_id);

    if (fetchUserError) {
      console.error("Fetch User Error:", fetchUserError);
      return res.status(500).json({ error: "Failed to retrieve user info." });
    }

    if (!userData || userData.length === 0) {
      return res
        .status(404)
        .json({ error: "No matching user found in system." });
    }

    const { email, type: user_type } = userData[0];

    // 4) Get all proj_id's for this user in the org_user table
    const { data: projIdsData, error: fetchProjIdsError } = await supabase
      .from("org_user")
      .select("proj_id")
      .eq("user_id", user_id)
      .eq("org_id", org_id);

    if (fetchProjIdsError || !projIdsData) {
      console.error("Fetch ProjIds Error:", fetchProjIdsError);
      return res.status(500).json({ error: "Failed to retrieve project IDs." });
    }

    const projIds = projIdsData.map((row) => row.proj_id);

    // 5) Decrement admin_users_count in "project" table for each relevant project
    if (projIds.length > 0 && !projIds.includes(null)) {
      const { data: projects, error: fetchProjectsError } = await supabase
        .from("project")
        .select("proj_id, admin_users_count")
        .in("proj_id", projIds);

      if (fetchProjectsError || !projects) {
        console.error("Fetch Projects Error:", fetchProjectsError);
        return res
          .status(500)
          .json({ error: "Failed to fetch projects for admin count update." });
      }

      // Loop through projects and update admin_users_count
      for (const project of projects) {
        const newCount = (project.admin_users_count || 0) - 1;

        const { error: updateCountError } = await supabase
          .from("project")
          .update({ admin_users_count: newCount })
          .eq("proj_id", project.proj_id);

        if (updateCountError) {
          console.error(
            `Failed to update admin count for project ${project.proj_id}:`,
            updateCountError
          );
          return res
            .status(500)
            .json({ error: "Failed to update admin count in projects." });
        }
      }
    }

    // 6) Delete from org_user table
    const { error: deleteOrgUserError } = await supabase
      .from("org_user")
      .delete()
      .eq("user_id", user_id)
      .eq("org_id", org_id);

    if (deleteOrgUserError) {
      console.error("Delete OrgUser Error:", deleteOrgUserError);
      return res.status(500).json({
        error: "Failed to remove user from the organization.",
      });
    }

    // 7) Delete from your "user" table
    const { error: deleteUserError } = await supabase
      .from("user")
      .delete()
      .eq("user_id", user_id);

    if (deleteUserError) {
      console.error("Delete User Error:", deleteUserError);
      return res
        .status(500)
        .json({ error: "Failed to delete user from the system." });
    }

    // 8) Look up the user in Supabase Auth by email (via listUsers) and delete from Auth
    const { data: listData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        filter: `email:eq.${email}`, // filter syntax: field:operator.value
        page: 1,
        perPage: 1,
      });

    if (listError) {
      console.error("Auth listUsers Error:", listError);
      return res
        .status(500)
        .json({ error: "Failed to find the user in Supabase Auth by email." });
    }

    if (!listData?.users || listData.users.length === 0) {
      console.warn(`No matching Auth user found with email: ${email}`);
      // If you consider this an error, do:
      return res.status(404).json({
        error: `No Auth user found with email: ${email}. User deleted from custom tables anyway.`,
      });
    }

    const userAuthUUID = listData.users[0].id;

    // Finally, delete from Supabase Auth
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userAuthUUID);
    if (deleteAuthError) {
      console.error("Delete Auth User Error:", deleteAuthError);
      return res.status(500).json({
        error: "Failed to delete user from Supabase authentication.",
      });
    }

    return res.status(200).json({
      message:
        "User successfully removed from org_user, user table, and Supabase Auth.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.changeOrgUserRole = async (req, res) => {
  try {
    const token = req.token;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { user_id, org_id, role } = req.body;

    if (!user_id || !org_id || !role) {
      return res
        .status(400)
        .json({ error: "user_id, org_id and role are required." });
    }

    const query = supabase
      .from("org_user")
      .update({ org_user_type: role })
      .eq("user_id", user_id);

    if (org_id !== undefined) {
      query.eq("org_id", org_id);
    }

    const { error: updateOrgUserError } = await query;

    if (updateOrgUserError) {
      console.error("Update Error:", updateOrgUserError);
      return res.status(500).json({ error: "Failed to update user role." });
    }

    const { error: updateUserError } = await supabase
      .from("user")
      .update({ type: role })
      .eq("user_id", user_id);

    if (updateUserError) {
      console.error("Update User Error:", updateUserError);
      return res
        .status(500)
        .json({ error: "Failed to update user type in user table." });
    }

    res.status(200).json({ message: "User role successfully updated." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Handles sending an invitation email to a user for joining Smartess projects.
 *
 * This function extracts the recipient's email, role, sender's name, and selected projects
 * from the request body, formats an HTML email, and sends the invitation using Resend.
 *
 * @param {Object} req - The HTTP request object containing:
 *   @property {string} req.body.email - The recipient's email address.
 *   @property {string} req.body.role - The role assigned to the user.
 *   @property {string} req.body.sender_name - The name of the sender inviting the user.
 *   @property {Object} req.body - Contains project information under dynamic keys (e.g., "projects[0]", "projects[1]").
 *
 * @param {Object} res - The HTTP response object used to return success or error messages.
 *
 * @returns {Response} - A JSON response:
 *   - `{ message: "Email sent successfully." }` on success (HTTP 200).
 *   - `{ message: "Failed to send email.", error: error.message }` on failure (HTTP 500).
 *
 * @throws {Error} If an error occurs while sending the email, it logs the error and returns a 500 response.
 */

exports.sendInvite = async (req, res) => {
  try {
    const { email, role, sender_name } = req.body;
    let projects = [];

    // Parse projects from request body
    if (req.body.projects) {
      if (typeof req.body.projects === "string") {
        projects = req.body.projects
          .split(",")
          .map((project) => project.trim());
      } else {
        projects = req.body.projects;
      }
    } else {
      projects = Object.keys(req.body)
        .filter((key) => key.startsWith("projects["))
        .map((key) => req.body[key]);
    }

    // First, check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", email)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking existing user:", userCheckError);
      return res
        .status(500)
        .json({ error: "Failed to check existing usgit aer." });
    }

    let userId;

    if (!existingUser) {
      // Create new user in user table - user_id will be auto-generated
      const { data: newUser, error: createUserError } = await supabase
        .from("user")
        .insert([
          {
            email: email,
            first_name: "Invitation",
            last_name: "Pending",
          },
        ])
        .select();

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return res.status(500).json({ error: "Failed to create user." });
      }

      if (!newUser || newUser.length === 0) {
        return res
          .status(500)
          .json({ error: "User creation failed - no user returned." });
      }

      userId = newUser[0].user_id; // Get the auto-generated user_id from the first (and only) created user
    } else {
      userId = existingUser.user_id;
    }

    // Get project IDs from project addresses
    const { data: projectData, error: projectError } = await supabase
      .from("project")
      .select("proj_id, org_id")
      .in("address", projects);

    if (projectError) {
      console.error("Error fetching projects:", projectError);
      return res.status(500).json({ error: "Failed to fetch project data." });
    }

    if (!projectData || projectData.length === 0) {
      return res.status(404).json({ error: "No matching projects found." });
    }

    // Create entries in org_user table for each project
    const orgUserEntries = projectData.map((project) => ({
      user_id: userId,
      org_id: project.org_id,
      proj_id: project.proj_id,
      org_user_type: role,
    }));

    // Insert all org_user entries
    const { error: orgUserError } = await supabase
      .from("org_user")
      .insert(orgUserEntries);

    if (orgUserError) {
      console.error("Error creating org_user entries:", orgUserError);

      // If org_user creation fails, cleanup the user if we just created them
      if (!existingUser) {
        await supabase.from("user").delete().eq("user_id", userId);
      }

      return res
        .status(500)
        .json({ error: "Failed to associate user with projects." });
    }

    // Increment admin_users_count for each project
    const updatePromises = projectData.map(async (project) => {
      const { data: currentProject } = await supabase
        .from("project")
        .select("admin_users_count")
        .eq("proj_id", project.proj_id)
        .single();

      const newCount = (currentProject?.admin_users_count || 0) + 1;

      return supabase
        .from("project")
        .update({ admin_users_count: newCount })
        .eq("proj_id", project.proj_id);
    });

    await Promise.all(updatePromises);

    // Generate a secure token using UUID v4
    const { v4: uuidv4 } = require("uuid");
    const token = uuidv4();

    // First delete any existing rows for this email and task
    const { error: deleteError } = await supabase
      .from("temp_acc_access")
      .delete()
      .match({ task: "registration", email: email });

    if (deleteError) {
      console.error("Error deleting existing token:", deleteError);
      return res.status(500).json({ error: "Failed to update access token." });
    }

    // Insert new token
    const { error: insertError } = await supabase
      .from("temp_acc_access")
      .insert([
        {
          token_id: token,
          task: "registration",
          email: email,
        },
      ]);

    if (insertError) {
      console.error("Error storing token:", insertError);

      // If token creation fails, cleanup the user if we just created them
      if (!existingUser) {
        await supabase.from("user").delete().eq("user_id", userId);
      }

      return res.status(500).json({ error: "Failed to create access token." });
    }

    const subject = `Smartess Organization Invite`;
    const webURL = process.env.WEBSITE_URL;

    // HTML template for the email
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>You have been invited to join Smartess</title>
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
            .project-list {
              padding-left: 20px;
              margin: 10px 0;
            }
            .instructions {
              margin-top: 20px;
              padding: 15px;
              background-color: #e9f5f8;
              border-left: 4px solid #4b7d8d;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="email-body">
                <p>Hello,</p>
                <p>You have been invited by ${sender_name} to join the following projects:</p>
                <ul class="project-list">
                  ${projects.map((project) => `<li>${project}</li>`).join("")}
                </ul>
                <p>As a <span class="highlight">${role}</span> user.</p>
                <div class="instructions">
                  <p>Please follow the steps below to join our system:</p>
                  <ol>
                    <li>Click here to complete your registration: <a href="${webURL}/registration?${token}">click here</a></li>
                    <li>Create your Smartess account or log in if you already have one.</li>
                    <li>Access your assigned projects from your dashboard.</li>
                  </ol>
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
      subject,
      html: htmlContent,
    });

    return res.status(200).json({
      message: "User created and email sent successfully to " + email,
    });
  } catch (error) {
    console.error("Failed to process invitation:", error);
    return res.status(500).json({
      message: "Failed to process invitation.",
      error: error.message,
    });
  }
};
