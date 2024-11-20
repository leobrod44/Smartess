const supabase = require('../config/supabase');


exports.getOrgUsers = async (req, res) => {
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
            .select('org_id, proj_id')
            .eq('user_id', userData.user_id);

        if (orgUserError) {
            return res.status(500).json({ error: 'Failed to fetch organization data.' });
        }

        // get all organizations and projects for the current user
        const orgIds = orgUserData.map((org) => org.org_id);
        const projIds = orgUserData.map((proj) => proj.proj_id);

        if (orgIds.length === 0) {
            return res.status(404).json({ error: 'No organizations found for this user.' });
        }

        const { data: allOrgUsers, error: allOrgUsersError } = await supabase
            .from('org_user')
            .select('user_id, org_id, proj_id, org_user_type')
            .in('org_id', orgIds)
            .in('proj_id', projIds)
            .neq('user_id', userData.user_id);

        if (allOrgUsersError) {
            return res.status(500).json({ error: 'Failed to fetch organization users.' });
        }

        res.json({ orgUsers: allOrgUsers});
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

exports.getOrgIndividualsData = async (req, res) => {
    try {
        const token = req.token;

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { fetchedOrgUsers } = req.body;

        if (!fetchedOrgUsers || fetchedOrgUsers.length === 0) {
            return res.status(400).json({ error: 'No organization users provided.' });
        }

        const userIds = fetchedOrgUsers.map(user => user.user_id);

        const { data: individualData, error: fetchError } = await supabase
            .from('user')
            .select('user_id, first_name, last_name') 
            .in('user_id', userIds);

        if (fetchError) {
            return res.status(500).json({ error: 'Failed to fetch individual data.' });
        }

        if (!individualData || individualData.length === 0) {
            return res.status(404).json({ error: 'No individuals found for the provided user IDs.' });
        }

        const individuals = individualData.map(user => {
            const orgUser = fetchedOrgUsers.find(org => org.user_id === user.user_id);

            return {
                individualId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                role: orgUser?.org_user_type || "basic", // default to basic if no role is found
            };
        });

        res.json({ individuals: individuals });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


exports.getOrgUsersProjects = async (req, res) => {
    try {
        const token = req.token;

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { fetchedOrgUsers } = req.body;

        if (!fetchedOrgUsers || fetchedOrgUsers.length === 0) {
            return res.status(400).json({ error: 'No organization users provided.' });
        }

        const uniqueProjIds = [...new Set(fetchedOrgUsers.map(user => user.proj_id))];

        const { data: projects, error: queryError } = await supabase
            .from('project')
            .select('*')
            .in('proj_id', uniqueProjIds);

        if (queryError) {
            console.error('Query Error:', queryError);
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }

        res.json({ projects: projects });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};