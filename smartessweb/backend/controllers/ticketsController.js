const supabase = require("../config/supabase");

exports.getTickets = async (req, res) => {
  try {
    const token = req.token;

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user_id from user table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError) {
      console.error("User Error:", userError);
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get projects from org_user table
    const { data: projectsData, error: projectsError } = await supabase
      .from("org_user")
      .select("proj_id")
      .eq("user_id", userData.user_id)
      .not("proj_id", "is", null);

    if (projectsError) {
      console.error("Projects Error:", projectsError);
      return res.status(500).json({ error: "Failed to fetch projects data." });
    }

    const projectIds = projectsData.map((proj) => proj.proj_id);

    // Get tickets for these projects with all needed fields
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select(
        `
                ticket_id,
                proj_id,
                hub_id,
                description,
                description_detailed,
                type,
                status,
                created_at
            `
      )
      .in("proj_id", projectIds);

    if (ticketsError) {
      console.error("Tickets Error:", ticketsError);
      return res.status(500).json({ error: "Failed to fetch tickets data." });
    }

    // Get unique hub_ids from tickets
    const uniqueHubIds = [
      ...new Set(ticketsData.map((ticket) => ticket.hub_id)),
    ];

    // Get unit numbers for these hub_ids
    const { data: hubData, error: hubError } = await supabase
      .from("hub")
      .select("hub_id, unit_number")
      .in("hub_id", uniqueHubIds);

    if (hubError) {
      console.error("Hub Error:", hubError);
      return res.status(500).json({ error: "Failed to fetch hub data." });
    }

    // Format tickets with hub information
    const formattedTickets = ticketsData.map((ticket) => {
      const hub = hubData.find((h) => h.hub_id === ticket.hub_id);
      const createdDate = new Date(ticket.created_at)
        .toISOString()
        .split("T")[0]; // Format: YYYY-MM-DD

      return {
        ticket_id: ticket.ticket_id,
        proj_id: ticket.proj_id,
        unit_id: ticket.hub_id,
        name: ticket.description,
        description: ticket.description_detailed,
        type: ticket.type,
        unit: hub ? hub.unit_number : null,
        status: ticket.status,
        created_at: createdDate,
      };
    });

    // Return formatted tickets
    res.json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user_id from user table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    // First, get the ticket to verify it exists and get its project ID
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("proj_id")
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError) {
      return res.status(500).json({ error: "Failed to fetch ticket data" });
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Verify user has access to this project, and retrieve org_user_type as well
    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("proj_id, org_user_type") // Important: also fetch org_user_type
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single(); // Expect a single row

    if (accessError) {
      return res.status(500).json({ error: "Failed to verify project access" });
    }

    if (!projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    // Check if user has admin or master role
    if (
      projectAccess.org_user_type !== "admin" &&
      projectAccess.org_user_type !== "master"
    ) {
      console.log("User type is:", projectAccess.org_user_type);
      return res
        .status(403)
        .json({ error: "User does not have permission to delete tickets" });
    }

    // Delete the ticket
    const { error: deleteError } = await supabase
      .from("tickets")
      .delete()
      .eq("ticket_id", ticket_id);

    if (deleteError) {
      return res.status(500).json({ error: "Failed to delete ticket" });
    }

    res.status(200).json({ message: "Ticket successfully deleted" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetchIndividualTicket = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user_id from user table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    // Fetch the ticket with all its details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
        ticket_id,
        proj_id,
        hub_id,
        description,
        description_detailed,
        type,
        status,
        created_at,
        submitted_by_user_id
      `
      )
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Verify user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("proj_id")
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single();

    if (accessError || !projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    // Get hub (unit) information
    const { data: hubData, error: hubError } = await supabase
      .from("hub")
      .select("unit_number")
      .eq("hub_id", ticket.hub_id)
      .single();

    if (hubError || !hubData) {
      return res
        .status(500)
        .json({ error: "Failed to fetch unit information" });
    }

    // Get submitter info
    const { data: submitterData, error: submitterError } = await supabase
      .from("user")
      .select("first_name, last_name, email")
      .eq("user_id", ticket.submitted_by_user_id)
      .single();

    // Get project address
    const { data: projectData, error: projectError } = await supabase
      .from("project")
      .select("address")
      .eq("proj_id", ticket.proj_id)
      .single();

    // Format the response
    const formattedTicket = {
      ticket_id: ticket.ticket_id,
      proj_id: ticket.proj_id,
      unit_id: ticket.hub_id,
      name: ticket.description,
      description: ticket.description_detailed,
      type: ticket.type,
      unit: hubData.unit_number,
      status: ticket.status,
      created_at: new Date(ticket.created_at).toISOString().split("T")[0],
      submitted_by_firstName: submitterData.first_name,
      submitted_by_lastName: submitterData.last_name,
      submitted_by_email: submitterData.email,
      project_address: projectData.address,
    };

    res.json({ ticket: formattedTicket });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssignableEmployees = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id } = req.params;

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get current user's id
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    // Get ticket and its project
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("proj_id")
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Verify user has admin/master access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("org_user_type")
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single();

    if (accessError || !projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    if (!["admin", "master"].includes(projectAccess.org_user_type)) {
      return res
        .status(403)
        .json({ error: "User does not have permission to assign tickets" });
    }

    // Get already assigned user IDs
    const { data: assignments, error: assignmentError } = await supabase
      .from("tickets_assignments")
      .select("assigned_to_user_id")
      .eq("ticket_id", ticket_id);

    if (assignmentError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch ticket assignments" });
    }

    const assignedUserIds = assignments
      ? assignments.map((a) => a.assigned_to_user_id)
      : [];

    // Get all employees for this project
    const { data: orgUsers, error: orgUsersError } = await supabase
      .from("org_user")
      .select("user_id, org_user_type")
      .eq("proj_id", ticket.proj_id)
      .in("org_user_type", ["basic", "admin", "master"]);

    if (orgUsersError) {
      return res.status(500).json({ error: "Failed to fetch employees" });
    }

    // Filter out already assigned users
    const unassignedOrgUsers = orgUsers.filter(
      (user) => !assignedUserIds.includes(user.user_id)
    );
    const userIds = unassignedOrgUsers.map((user) => user.user_id);

    // Get employee details
    const { data: employees, error: employeesError } = await supabase
      .from("user")
      .select("user_id, first_name, last_name, email")
      .in("user_id", userIds);

    if (employeesError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch employee details" });
    }

    const formattedEmployees = employees.map((emp) => {
      const orgUser = unassignedOrgUsers.find(
        (ou) => ou.user_id === emp.user_id
      );
      return {
        employeeId: emp.user_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        role: orgUser.org_user_type,
      };
    });

    res.json({ employees: formattedEmployees });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssignedUsers = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id } = req.params;

    // Validate token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: "Invalid token" });

    // Get assignments for this ticket from tickets_assignments table
    const { data: assignments, error: assignmentError } = await supabase
      .from("tickets_assignments")
      .select(
        `
        assigned_to_user_id,
        resolved_status
      `
      )
      .eq("ticket_id", ticket_id);

    if (assignmentError) {
      return res.status(500).json({ error: "Failed to fetch assignments" });
    }

    // Return empty array if no assignments found
    if (!assignments.length) {
      return res.json({ assignedUsers: [] });
    }

    // Get user IDs from assignments
    const userIds = assignments.map((a) => a.assigned_to_user_id);

    // Fetch user details for assigned users
    const { data: users, error: userError } = await supabase
      .from("user")
      .select("user_id, first_name, last_name, email")
      .in("user_id", userIds);

    if (userError) {
      return res.status(500).json({ error: "Failed to fetch user details" });
    }

    // Combine user details with assignment status
    const assignedUsers = assignments.map((assignment) => {
      const user = users.find(
        (u) => u.user_id === assignment.assigned_to_user_id
      );
      return {
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        resolved: assignment.resolved_status,
      };
    });

    res.json({ assignedUsers });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.assignUsersToTicket = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id, user_ids, assigned_by_user_id } = req.body;

    if (
      !ticket_id ||
      !user_ids ||
      !Array.isArray(user_ids) ||
      !assigned_by_user_id
    ) {
      return res.status(400).json({ error: "Invalid request data" });
    }

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

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("proj_id, description, status")
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "closed") {
      return res
        .status(400)
        .json({ error: "Cannot assign users to a closed ticket" });
    }

    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("org_user_type")
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single();

    if (!projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    if (!["admin", "master"].includes(projectAccess.org_user_type)) {
      return res
        .status(403)
        .json({ error: "User does not have permission to assign tickets" });
    }

    const { data: currentAssignments, error: countError } = await supabase
      .from("tickets_assignments")
      .select("assigned_to_user_id")
      .eq("ticket_id", ticket_id);

    if (countError) {
      return res
        .status(500)
        .json({ error: "Failed to check current assignments" });
    }

    const totalAssignments =
      (currentAssignments?.length || 0) + user_ids.length;
    if (totalAssignments > 3) {
      return res
        .status(400)
        .json({ error: "Maximum 3 users can be assigned to a ticket" });
    }

    const assignments = user_ids.map((user_id) => ({
      ticket_id,
      assigned_to_user_id: user_id,
      assigned_by_user_id,
      resolved_status: "unresolved",
    }));

    const { error: assignmentInsertError } = await supabase
      .from("tickets_assignments")
      .insert(assignments);

    if (assignmentInsertError) {
      return res.status(500).json({ error: "Failed to assign users" });
    }

    const notifications = user_ids.map((user_id) => ({
      notification_to_user_id: user_id,
      notification_type: "assignment",
      ticket_id: ticket_id,
      ticket_description: ticket.description,
      assigned_to_user_id: user_id,
      assigned_by_user_id: assigned_by_user_id,
    }));

    const { error: notificationsInsertError } = await supabase
      .from("tickets_notifications")
      .insert(notifications);

    if (notificationsInsertError) {
      return res.status(500).json({ error: "Failed to create notifications" });
    }

    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "pending" })
      .eq("ticket_id", ticket_id);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update ticket status" });
    }

    res.status(200).json({ message: "Users successfully assigned to ticket" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.unassignUserFromTicket = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id, user_id, assigned_by_user_id } = req.body;

    // Validate input: ticket_id, user_id, and assigned_by_user_id must be provided
    if (!ticket_id || !user_id || !assigned_by_user_id) {
      return res.status(400).json({ error: "Invalid request data" });
    }

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

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("proj_id, status, description")
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "closed") {
      return res
        .status(400)
        .json({ error: "Cannot unassign users from a closed ticket" });
    }

    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("org_user_type")
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single();

    if (!projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    if (!["admin", "master"].includes(projectAccess.org_user_type)) {
      return res
        .status(403)
        .json({ error: "User does not have permission to unassign users" });
    }

    const { error: deleteError } = await supabase
      .from("tickets_assignments")
      .delete()
      .eq("ticket_id", ticket_id)
      .eq("assigned_to_user_id", user_id);

    if (deleteError) {
      return res.status(500).json({ error: "Failed to unassign user" });
    }

    const notifications = {
      notification_to_user_id: user_id,
      notification_type: "unnassignment",
      ticket_id: ticket_id,
      ticket_description: ticket.description,
      assigned_to_user_id: user_id,
      assigned_by_user_id: assigned_by_user_id,
    };

    const { error: notificationInsertError } = await supabase
      .from("tickets_notifications")
      .insert(notifications);
    if (notificationInsertError) {
      return res
        .status(500)
        .json({ error: "Failed to create unassignment notification" });
    }

    const { data: remainingAssignments, error: checkError } = await supabase
      .from("tickets_assignments")
      .select("assigned_to_user_id")
      .eq("ticket_id", ticket_id);

    if (!checkError && remainingAssignments.length === 0) {
      // Update ticket status to open if no assignments remain
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: "open" })
        .eq("ticket_id", ticket_id);

      if (updateError) {
        return res
          .status(500)
          .json({ error: "Failed to update ticket status" });
      }
    }

    res
      .status(200)
      .json({ message: "User successfully unassigned from ticket" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user_id from user table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    // Get the ticket to verify it exists and get its project ID
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("proj_id, status")
      .eq("ticket_id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Verify user has access to this project and proper role
    const { data: projectAccess, error: accessError } = await supabase
      .from("org_user")
      .select("org_user_type")
      .eq("user_id", userData.user_id)
      .eq("proj_id", ticket.proj_id)
      .single();

    if (accessError || !projectAccess) {
      return res
        .status(403)
        .json({ error: "User does not have access to this ticket" });
    }

    if (!["admin", "master"].includes(projectAccess.org_user_type)) {
      return res
        .status(403)
        .json({ error: "User does not have permission to close tickets" });
    }

    // Update ticket status to closed
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "closed" })
      .eq("ticket_id", ticket_id);

    if (updateError) {
      return res.status(500).json({ error: "Failed to close ticket" });
    }

    res.status(200).json({ message: "Ticket successfully closed" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssignedTicketsForUser = async (req, res) => {
  try {
    const token = req.token;

    // Verify user token and get user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Retrieve the user record to get the user_id
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();
    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    // Fetch ticket assignments for this user
    const { data: assignments, error: assignmentError } = await supabase
      .from("tickets_assignments")
      .select(
        "ticket_id, resolved_status, assigned_by_user_id, assigned_to_user_id"
      )
      .eq("assigned_to_user_id", userData.user_id);
    if (assignmentError) {
      return res
        .status(500)
        .json({ error: "Failed to fetch ticket assignments." });
    }

    // Return empty array if no assignments found
    if (!assignments || assignments.length === 0) {
      return res.json({ tickets: [] });
    }

    // Create a map for quick lookup of resolved_status and assigned_by_user_id by ticket_id
    const assignmentMap = {};
    assignments.forEach((assignment) => {
      assignmentMap[assignment.ticket_id] = {
        resolved_status: assignment.resolved_status,
        assigned_by_user_id: assignment.assigned_by_user_id,
        assigned_to_user_id: assignment.assigned_to_user_id,
      };
    });

    // Extract ticket IDs from assignments
    const ticketIds = assignments.map((a) => a.ticket_id);

    // Fetch ticket details from tickets table
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select(
        `ticket_id, proj_id, hub_id, description, description_detailed, type, status, created_at`
      )
      .in("ticket_id", ticketIds);
    if (ticketsError) {
      return res.status(500).json({ error: "Failed to fetch tickets data." });
    }

    // Get unique hub IDs from tickets to fetch unit numbers
    const hubIds = [...new Set(ticketsData.map((ticket) => ticket.hub_id))];
    const { data: hubsData, error: hubsError } = await supabase
      .from("hub")
      .select("hub_id, unit_number")
      .in("hub_id", hubIds);
    if (hubsError) {
      return res.status(500).json({ error: "Failed to fetch hub data." });
    }

    // Format each ticket to match the Ticket interface
    const formattedTickets = ticketsData.map((ticket) => {
      const hub = hubsData.find((h) => h.hub_id === ticket.hub_id);
      const formattedDate = new Date(ticket.created_at)
        .toISOString()
        .split("T")[0]; // Format: YYYY-MM-DD
      return {
        ticketId: ticket.ticket_id,
        projectId: ticket.proj_id,
        unitId: ticket.hub_id,
        name: ticket.description,
        description: ticket.description_detailed,
        type: ticket.type,
        unit: hub ? hub.unit_number : null,
        status: ticket.status,
        date: formattedDate,
        isResolved:
          assignmentMap[ticket.ticket_id].resolved_status === "resolved",
        assignedByUserId: assignmentMap[ticket.ticket_id].assigned_by_user_id,
        assignedToUserId: assignmentMap[ticket.ticket_id].assigned_to_user_id,
      };
    });

    // Return the formatted tickets
    res.json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Error in getAssignedTicketsForUser:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateTicketResolutionStatus = async (req, res) => {
  try {
    const token = req.token;
    const { ticket_id, status } = req.body;

    if (!ticket_id || !status || !["resolved", "unresolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user_id from the user table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    const { data: assignmentRecord, error: assignmentError } = await supabase
      .from("tickets_assignments")
      .select("*")
      .eq("ticket_id", ticket_id)
      .eq("assigned_to_user_id", userData.user_id)
      .single();
    if (assignmentError || !assignmentRecord) {
      return res
        .status(500)
        .json({ error: "Failed to fetch ticket assignment." });
    }

    if (assignmentRecord.resolved_status === status) {
      return res
        .status(400)
        .json({ error: `Ticket is already marked as ${status}.` });
    }

    const { error: updateError } = await supabase
      .from("tickets_assignments")
      .update({ resolved_status: status })
      .eq("ticket_id", ticket_id)
      .eq("assigned_to_user_id", userData.user_id);
    if (updateError) {
      return res
        .status(500)

        .json({ error: `Failed to mark ticket as ${status}.` });
    }

    const { data: ticketData, error: ticketDataError } = await supabase
      .from("tickets")
      .select("description")
      .eq("ticket_id", ticket_id)
      .single();

    const ticketDescription = ticketData ? ticketData.description : "";

    const notificationType = status;

    const { error: notificationError } = await supabase
      .from("tickets_notifications")
      .insert({
        notification_to_user_id: assignmentRecord.assigned_by_user_id,
        notification_type: notificationType,
        ticket_id: ticket_id,
        ticket_description: ticketDescription,
        assigned_to_user_id: userData.user_id,
        assigned_by_user_id: assignmentRecord.assigned_by_user_id,
      });
    if (notificationError) {
      return res.status(500).json({ error: "Failed to create notification." });
    }
    res.status(200).json({ message: `Ticket marked as ${status}.` });
  } catch (error) {
    console.error("Error in updateTicketResolutionStatus:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getTicketNotifications = async (req, res) => {
  try {
    // Extract the token from the request
    const token = req.token;

    // Authenticate the user using the provided token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Retrieve user details from the "user" table using the email from the authenticated user
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", user.email)
      .single();
    if (userError) {
      console.error("User Error:", userError);
      return res.status(500).json({ error: "Failed to fetch user data." });
    }
    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    // Retrieve notifications for the user from the "tickets_notifications" table.
    // Note: Corrected table name from "tickets_notification" to "tickets_notifications"
    const { data: userNotifications, error: userNotificationError } =
      await supabase
        .from("tickets_notifications")
        .select("*")
        .eq("notification_to_user_id", userData.user_id);
    if (userNotificationError) {
      console.error("Notification Error:", userNotificationError);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }

    // Return the retrieved notifications in the response
    return res.status(200).json(userNotifications);
  } catch (error) {
    // Log unexpected errors and return a generic internal server error response
    console.error("Error in getTicketNotifications:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
