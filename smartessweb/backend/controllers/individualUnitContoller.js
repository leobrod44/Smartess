const supabase = require('../config/supabase');

exports.getCurrentUser = async (req, res) => {
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

        const { data: currentUser, error: currentUserError } = await supabase
        .from('org_user')
        .select('user_id, proj_id, org_id, org_user_type')
        .eq('user_id', userData.user_id);

        if (currentUserError) {
            return res.status(500).json({ error: 'Failed to fetch current user data.' });
        }

        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found.' });
        }

        const projectIds = currentUser.map((cUser) => cUser.proj_id);
        const { data: projects, error: projectError } = await supabase
            .from('project')
            .select('address')
            .in('proj_id', projectIds);

        if (projectError) {
            return res.status(500).json({ error: 'Failed to fetch project addresses.' });
        }

        const addresses = projects.map((project) => project.address);
        const role = currentUser[0].org_user_type; 

        const formattedCurrentUser = {
            userId: userData.user_id,
            role: role === 'master' || role === 'admin' || role === 'basic' ? role : 'basic', 
            address: addresses
        };

        res.json({ currentUser: formattedCurrentUser });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

exports.getIndividualUnit = async (req, res) => {
    try {                
        const token = req.token;
        const { unit_id } = req.body;

        // Validate token and get user information
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }


        // Fetch hub data based on unit_id
        const { data: hubData, error: hubError } = await supabase
            .from('hub')
            .select('hub_id, unit_number')
            .eq('unit_number', unit_id)
            .single();

        if (hubError || !hubData) {
            return res.status(404).json({ error: 'Unit not found.' });
        }

        // Fetch hub users and identify the owner
        const { data: hubUsersData, error: hubUsersError } = await supabase
            .from('hub_user')
            .select('user_id, hub_user_type')
            .eq('hub_id', hubData.hub_id);

        if (hubUsersError) {
            return res.status(500).json({ error: 'Failed to fetch hub users.' });
        }

        const ownerData = hubUsersData.find(user => user.hub_user_type === 'owner');
        let owner = {
            tokenId: "",
            firstName: "",
            lastName: "",
            email: ""
        };

        if (ownerData) {
            const { data: ownerUserData, error: ownerError } = await supabase
                .from('user')
                .select('user_id, first_name, last_name, email, phone_number')
                .eq('user_id', ownerData.user_id)
                .single();

            if (!ownerError && ownerUserData) {
                owner = {
                    tokenId: ownerUserData.user_id,
                    firstName: ownerUserData.first_name,
                    lastName: ownerUserData.last_name,
                    email: ownerUserData.email,
                    telephone: ownerUserData.phone_number
                };
            }
        }

        // Fetch tickets for the hub
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('hub_id', hubData.hub_id);

        if (ticketsError) {
            return res.status(500).json({ error: 'Failed to fetch tickets.' });
        }

        const formattedTickets = ticketsData.map(ticket => ({
            ticket_id: ticket.ticket_id,
            unit_id: ticket.hub_id,
            type: ticket.type,
            status: ticket.status,
            created_at: ticket.created_at,
            unit_number: "",
            project_address: "",
            submitted_by_email: "",
            submitted_by_firstName: "",
            submitted_by_lastName: "",
            title: "",
            description: ticket.description,
            assigned_employees: [],
          }));

        // Remove the owner from hubUsersData
        const filteredHubUsersData = hubUsersData.filter(user => user.hub_user_type !== 'owner');

        // Fetch all hub users for the current hub
        const hubUsers = await Promise.all(filteredHubUsersData.map(async (hubUser) => {
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('user_id, first_name, last_name, email, phone_number')
                .eq('user_id', hubUser.user_id)
                .single();

            if (userError || !userData) {
                return null;
            }

            return {
                tokenId: userData.user_id,
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                telephone: userData.phone_number
            };
        }));

        // Construct the final unit object
        const unit = {
            projectId: hubData.proj_id,
            unit_id: hubData.hub_id,
            unitNumber: hubData.unit_number,
            hubUsers: hubUsers.filter(user => user !== null),
            ticket: formattedTickets,
            owner,
            alerts: [] // Placeholder for alerts
        };

        res.json({ unit });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.removeUserFromHub = async (req, res) => {
    try {    
        const token = req.token;
        const { user_id } = req.body;

        // Validate token and get user information
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { error: deleteError } = await supabase
            .from('hub_user')
            .delete()
            .eq('user_id', user_id);

        if (deleteError) {
            return res.status(500).json({ error: 'Failed to remove user from hub.' });
        }

        res.status(200).json({ message: 'User successfully removed from the hub.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};