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
                .select('unit_number')
                .eq('proj_id', project.proj_id)
                .order('unit_number', { ascending: true });

            if (hubError) {
                console.error(`Error fetching hubs for project ${project.proj_id}:`, hubError);
                return null;
            }

            // Transform to match Project interface in frontend
            return {
                projectId: project.proj_id,
                address: project.address,
                adminUsers: project.admin_users_count,
                hubUsers: project.hub_users_count,
                pendingTickets: project.pending_tickets_count,
                projectUsers: [], // Empty array
                units: hubs.map(hub => ({
                    unitNumber: hub.unit_number,
                    users: [], // Empty array
                    tickets: {  // Empty ticket
                        total: 0,
                        open: 0,
                        pending: 0,
                        closed: 0
                    },
                    owner: {   // Empty owner info
                        tokenId: "",
                        firstName: "",
                        lastName: "",
                        email: ""
                    },
                    alerts: [] // Empty alerts array
                }))
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