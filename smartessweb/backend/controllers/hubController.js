const supabase = require('../config/supabase');

exports.getHubDetails = async (req, res) => {
    try {
        const token = req.token; // From middleware
        const { proj_id, unit_number } = req.params; // Get from URL params
        
        // First, get the hub_id using proj_id and unit_number
        const { data: hubData, error: hubError } = await supabase
            .from('hub')
            .select('hub_id')
            .eq('proj_id', proj_id)
            .eq('unit_number', unit_number)
            .single();

        if (hubError) {
            return res.status(500).json({ error: 'Failed to fetch hub.' });
        }

        if (!hubData) {
            return res.status(404).json({ error: 'Hub not found.' });
        }

        const hub_id = hubData.hub_id;

        // Get hub users with their details
        const { data: hubUsers, error: hubUsersError } = await supabase
            .from('hub_user')
            .select(`
                user_id,
                hub_user_type,
                user:user_id (
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('hub_id', hub_id);

        if (hubUsersError) {
            return res.status(500).json({ error: 'Failed to fetch hub users.' });
        }

        // Get ticket counts
        const { data: tickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('status')
            .eq('hub_id', hub_id);

        if (ticketsError) {
            return res.status(500).json({ error: 'Failed to fetch tickets.' });
        }

        // Get active alerts
        const { data: alerts, error: alertsError } = await supabase
            .from('alerts')
            .select('*')
            .eq('hub_id', hub_id)
            .eq('active', true);

        if (alertsError) {
            return res.status(500).json({ error: 'Failed to fetch alerts.' });
        }

        // Process the data to match the frontend structure
        const owner = hubUsers
            ?.filter(user => user.hub_user_type === 'owner')
            .map(owner => ({
                tokenId: owner.user_id,
                firstName: owner.user.first_name,
                lastName: owner.user.last_name,
                email: owner.user.email
            }))[0] || null;

        const users = hubUsers
            ?.filter(user => user.hub_user_type === 'basic' || user.hub_user_type === 'admin')
            .map(user => ({
                tokenId: user.user_id,
                firstName: user.user.first_name,
                lastName: user.user.last_name,
                role: user.hub_user_type
            })) || [];

        const ticketStats = {
            total: tickets?.length || 0,
            open: tickets?.filter(t => t.status === 'open').length || 0,
            pending: tickets?.filter(t => t.status === 'pending').length || 0,
            closed: tickets?.filter(t => t.status === 'closed').length || 0
        };

        const formattedAlerts = alerts?.map(alert => ({
            id: alert.id,
            projectId: proj_id,
            unitNumber: unit_number,
            message: alert.description,
            timestamp: alert.created_at,
            resolved: !alert.active,
            icon: alert.icon || 'default-icon'
        })) || [];

        res.json({
            owner,
            users,
            tickets: ticketStats,
            alerts: formattedAlerts
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

