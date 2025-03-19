const supabase = require("../config/supabase");

exports.getProjectsForAlerts = async (req, res) => {
    try {
        const token = req.token;
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('user_id')
            .eq('email', user.email)
            .single();

        if (userError) {
            return res.status(500).json({ error: 'Failed to fetch user data.' });
        }

        if (!userData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const { data: orgUserData, error: orgUserError } = await supabase
            .from('org_user')
            .select('org_id')
            .eq('user_id', userData.user_id);

        if (orgUserError) {
            return res.status(500).json({ error: 'Failed to fetch organization data.' });
        }

        const orgIds = orgUserData.map(org => org.org_id);

        if (orgIds.length === 0) {
            return res.json({ projects: [] });
        }

        // Get projects with basic info
        const { data: projects, error: projectError } = await supabase
            .from('project')
            .select(`
                proj_id,
                address,
                admin_users_count,
                hub_users_count,
                pending_tickets_count
            `)
            .in('org_id', orgIds)
            .order('proj_id', { ascending: true });

        if (projectError) {
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }

        // Fetch all hubs across projects
        const { data: hubs, error: hubError } = await supabase
            .from('hub')
            .select('hub_id, proj_id, unit_number')
            .in('proj_id', projects.map(p => p.proj_id))
            .order('unit_number', { ascending: true });

        if (hubError) {
            return res.status(500).json({ error: 'Failed to fetch hubs.' });
        }

        // Extract hub IDs for alerts lookup
        const hubIds = hubs.map(hub => hub.hub_id);

        // Fetch alerts for the hubs
        const { data: alerts, error: alertsError } = await supabase
            .from("alerts")
            .select("*")
            .in("hub_id", hubIds)
            .order("created_at", { ascending: false });

        if (alertsError) {
            return res.status(500).json({ error: "Failed to fetch alerts." });
        }

        // Format alerts
        const formattedAlerts = alerts.map(alert => {
            const hub = hubs.find(h => h.hub_id === alert.hub_id);
            return {
                id: alert.alert_id,
                hubId: alert.hub_id,
                unitNumber: hub ? hub.unit_number : null,
                projectId: hub ? hub.proj_id : null,
                description: alert.description,
                message: alert.message,
                active: alert.active,
                type: alert.type,
                timestamp: alert.created_at,
                deviceId: alert.device_id,
                hubIp: alert.hub_ip,
            };
        });

        // Transform projects to match Project interface
        const transformedProjects = await Promise.all(projects.map(async (project) => {
            // Get hubs related to the project
            const projectHubs = hubs.filter(hub => hub.proj_id === project.proj_id);

            // Process units with alerts
            const units = await Promise.all(projectHubs.map(async (hub) => {
                // Fetch user IDs and hub_user_type for the current hub
                const { data: hubUsers, error: hubUserError } = await supabase
                    .from('hub_user')
                    .select('user_id, hub_user_type')
                    .eq('hub_id', hub.hub_id)
                    .order('hub_id', { ascending: true });

                if (hubUserError) {
                    console.error(`Error fetching users for hub ${hub.hub_id}:`, hubUserError);
                    return null;
                }

                // Find the owner
                const hubOwner = hubUsers.find(user => user.hub_user_type === 'owner');
                
                // Fetch owner data
                let owner = {
                    tokenId: "",
                    firstName: "",
                    lastName: "",
                    email: ""
                };
                if (hubOwner) {
                    const { data: ownerData, error: ownerError } = await supabase
                        .from('user')
                        .select('user_id, first_name, last_name, email')
                        .eq('user_id', hubOwner.user_id);

                    if (ownerError) {
                        console.error(`Error fetching data for user ${hubOwner.user_id}:`, ownerError);
                    } else {
                        owner = {
                            tokenId: ownerData[0].user_id,
                            firstName: ownerData[0].first_name,
                            lastName: ownerData[0].last_name,
                            email: ownerData[0].email,
                        };
                    }
                }

                // Fetch all users related to the hub
                const users = await Promise.all(hubUsers.map(async (hubUser) => {
                    const { data: userData, error: userError } = await supabase
                        .from('user')
                        .select('user_id, first_name, last_name, email')
                        .eq('user_id', hubUser.user_id);

                    if (userError) {
                        console.error(`Error fetching data for user ${hubUser.user_id}:`, userError);
                        return null;
                    }

                    return {
                        tokenId: userData[0].user_id,
                        firstName: userData[0].first_name,
                        lastName: userData[0].last_name,
                        email: userData[0].email,
                    };
                }));

                // Attach alerts related to this unit
                const unitAlerts = formattedAlerts.filter(alert => alert.unitNumber === hub.unit_number);

                // Return the transformed unit data
                return {
                    unitNumber: hub.unit_number,
                    hubUsers: users.filter(user => user !== null),
                    tickets: {  
                        total: 0,
                        open: 0,
                        pending: 0,
                        closed: 0
                    },
                    owner,
                    alerts: unitAlerts // Attach alerts here
                };
            }));

            // Return the transformed project data
            return {
                projectId: project.proj_id,
                address: project.address,
                adminUsersCount: project.admin_users_count,
                hubUsersCount: project.hub_users_count,
                pendingTicketsCount: project.pending_tickets_count,
                projectUsers: [], // Empty array
                units: units.filter(unit => unit !== null) 
            };
        })); 

        // Filter out any null values from failed transformations
        const validProjects = transformedProjects.filter(project => project !== null);

        res.json({ projects: validProjects });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
