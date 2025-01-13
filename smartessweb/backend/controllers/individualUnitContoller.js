const supabase = require('../config/supabase');

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
                .select('user_id, first_name, last_name, email')
                .eq('user_id', ownerData.user_id)
                .single();

            if (!ownerError && ownerUserData) {
                owner = {
                    tokenId: ownerUserData.user_id,
                    firstName: ownerUserData.first_name,
                    lastName: ownerUserData.last_name,
                    email: ownerUserData.email,
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


        // Fetch all hub users for the current hub
        const hubUsers = await Promise.all(hubUsersData.map(async (hubUser) => {
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('user_id, first_name, last_name, email')
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