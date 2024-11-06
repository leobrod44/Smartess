const supabase = require('../config/supabase');

exports.getUserProjects = async (req, res) => {
    try {
        const token = req.token; // From middleware
        
        // Get user email from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user_id from user table using email
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

        // Get org_ids from org_user table
        const { data: orgUserData, error: orgUserError } = await supabase
            .from('org_user')
            .select('org_id')
            .eq('user_id', userData.user_id);

        if (orgUserError) {
            return res.status(500).json({ error: 'Failed to fetch organization data.' });
        }

        // Extract org_ids
        const orgIds = orgUserData.map(org => org.org_id);

        if (orgIds.length === 0) {
            return res.json({ projects: [] });
        }

        // Get projects with basic info, sorted by proj_id
        const { data: projects, error: projectError } = await supabase
            .from('project')
            .select(`
                proj_id,
                name,
                address,
                units_count,
                hub_users_count,
                admin_users_count,
                pending_tickets_count
            `)
            .in('org_id', orgIds)
            .order('proj_id', { ascending: true });

        if (projectError) {
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }

        // For each project, fetch the unit numbers from hubs with sorting
        const projectsWithUnits = await Promise.all(projects.map(async (project) => {
            const { data: hubs, error: hubError } = await supabase
                .from('hub')
                .select('unit_number')
                .eq('proj_id', project.proj_id)
                .order('unit_number', { ascending: true });

            if (hubError) {
                console.error(`Error fetching hubs for project ${project.proj_id}:`, hubError);
                return {
                    ...project,
                    unit_numbers: []
                };
            }

            return {
                ...project,
                unit_numbers: hubs.map(hub => hub.unit_number)
            };
        }));

        res.json({ projects: projectsWithUnits });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};