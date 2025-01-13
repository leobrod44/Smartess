const supabase = require('../config/supabase');

exports.getTickets = async (req, res) => {
    try {
        const token = req.token;
        
        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user_id from user table
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('user_id')
            .eq('email', user.email)
            .single();

        if (userError) {
            console.error('User Error:', userError);
            return res.status(500).json({ error: 'Failed to fetch user data.' });
        }

        if (!userData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Get projects from org_user table
        const { data: projectsData, error: projectsError } = await supabase
            .from('org_user')
            .select('proj_id')
            .eq('user_id', userData.user_id)
            .not('proj_id', 'is', null);

        if (projectsError) {
            console.error('Projects Error:', projectsError);
            return res.status(500).json({ error: 'Failed to fetch projects data.' });
        }

        const projectIds = projectsData.map(proj => proj.proj_id);

        // Get tickets for these projects with all needed fields
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select(`
                ticket_id,
                proj_id,
                hub_id,
                description,
                description_detailed,
                type,
                status,
                created_at
            `)
            .in('proj_id', projectIds);

        if (ticketsError) {
            console.error('Tickets Error:', ticketsError);
            return res.status(500).json({ error: 'Failed to fetch tickets data.' });
        }

        // Get unique hub_ids from tickets
        const uniqueHubIds = [...new Set(ticketsData.map(ticket => ticket.hub_id))];

        // Get unit numbers for these hub_ids
        const { data: hubData, error: hubError } = await supabase
            .from('hub')
            .select('hub_id, unit_number')
            .in('hub_id', uniqueHubIds);

        if (hubError) {
            console.error('Hub Error:', hubError);
            return res.status(500).json({ error: 'Failed to fetch hub data.' });
        }

        // Format tickets with hub information
        const formattedTickets = ticketsData.map(ticket => {
            const hub = hubData.find(h => h.hub_id === ticket.hub_id);
            const createdDate = new Date(ticket.created_at).toISOString().split('T')[0]; // Format: YYYY-MM-DD

            return {
                ticket_id: ticket.ticket_id,
                proj_id: ticket.proj_id,
                unit_id: ticket.hub_id,
                name: ticket.description,
                description: ticket.description_detailed,
                type: ticket.type,
                unit: hub ? hub.unit_number : null,
                status: ticket.status,
                created_at: createdDate
            };
        });

        // Return formatted tickets
        res.json({ tickets: formattedTickets });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};