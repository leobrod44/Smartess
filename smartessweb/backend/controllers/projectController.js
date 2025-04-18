const supabase = require('../config/supabase');

exports.getUserProjects = async (req, res) => {
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

        // Transform projects to match Project interface
        const transformedProjects = await Promise.all(projects.map(async (project) => {
            // Fetch unit numbers for each project
            const { data: hubs, error: hubError } = await supabase
                .from('hub')
                .select('hub_id, unit_number')
                .eq('proj_id', project.proj_id)
                .order('unit_number', { ascending: true });
        
            if (hubError) {
                console.error(`Error fetching hubs for project ${project.proj_id}:`, hubError);
                return null;
            }
        
            // Fetch users for each hub and transform the data to match the frontend Project interface
            const units = await Promise.all(hubs.map(async (hub) => {
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
        
                // Find the owner by filtering for hub_user_type
                const hubOwner = hubUsers.find(user => user.hub_user_type === 'owner');
                
                // Fetch user data for the owner if exists
                let owner = {
                    tokenId: "",
                    firstName: "",
                    lastName: "",
                    email: ""
                };
                if (hubOwner) {
                    const { data: userData, error: userError } = await supabase
                        .from('user')
                        .select('user_id, first_name, last_name, email')
                        .eq('user_id', hubOwner.user_id);
        
                    if (userError) {
                        console.error(`Error fetching data for user ${hubOwner.user_id}:`, userError);
                    } else {
                        owner = {
                            tokenId: userData[0].user_id,
                            firstName: userData[0].first_name,
                            lastName: userData[0].last_name,
                            email: userData[0].email,
                        };
                    }
                }
        
                // Fetch user data for each user_id associated with the hub
                const users = await Promise.all(hubUsers.map(async (hubUser) => {
                    const { data: userData, error: userError } = await supabase
                        .from('user')
                        .select('user_id, first_name, last_name, email')
                        .eq('user_id', hubUser.user_id);
        
                    if (userError) {
                        console.error(`Error fetching data for user ${hubUser.user_id}:`, userError);
                        return null;
                    }
        
                    // Return the user data for the frontend
                    return {
                        tokenId: userData[0].user_id,
                        firstName: userData[0].first_name,
                        lastName: userData[0].last_name,
                        email: userData[0].email,
                    };
                }));
        
                // Return the transformed unit data with the owner populated
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
                    alerts: [] // Empty alerts array
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