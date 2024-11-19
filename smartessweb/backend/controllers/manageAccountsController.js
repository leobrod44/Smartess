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
            .in('proj_id', projIds);

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
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}