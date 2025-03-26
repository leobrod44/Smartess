const supabase = require('../config/supabase');

exports.getDashboardWidgets = async (req, res) => {
    try {
        const token = req.token;
        
        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user_id from email
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('user_id')
            .eq('email', user.email)
            .single();

        if (userError || !userData) {
            return res.status(500).json({ error: 'Failed to fetch user data.' });
        }

        // Get org_ids for the user
        const { data: orgUserData, error: orgUserError } = await supabase
            .from('org_user')
            .select('org_id')
            .eq('user_id', userData.user_id);

        if (orgUserError) {
            return res.status(500).json({ error: 'Failed to fetch organization data.' });
        }

        const orgIds = orgUserData.map(org => org.org_id);
        
        if (orgIds.length === 0) {
            return res.status(404).json({ error: 'No organizations found for user.' });
        }

        // Get all projects for the user's organizations
        const { data: projects, error: projectError } = await supabase
            .from('project')
            .select('proj_id, address')
            .in('org_id', orgIds);

        if (projectError) {
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }

        // Get project IDs
        const projectIds = projects.map(project => project.proj_id);

        // Get all hubs (units) with their status for these projects
        const { data: hubs, error: hubError } = await supabase
            .from('hub')
            .select('hub_id, unit_number, proj_id, status')  // Added status field
            .in('proj_id', projectIds);

        if (hubError) {
            return res.status(500).json({ error: 'Failed to fetch hubs.' });
        }

        // Calculate system health statistics
        const systemHealth = {
            systemsLive: hubs.filter(hub => hub.status === 'live').length,
            systemsDown: hubs.filter(hub => hub.status === 'disconnected').length,
        };

        // Get admin users count
        const { data: adminUsers, error: adminError } = await supabase
            .from('org_user')
            .select('user_id')
            .in('org_id', orgIds);

        if (adminError) {
            return res.status(500).json({ error: 'Failed to fetch admin users.' });
        }

        const uniqueAdminUsers = [...new Set(adminUsers.map(user => user.user_id))];

        // Get pending tickets count
        const { data: tickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('ticket_id, status')
            .in('hub_id', hubs.map(hub => hub.hub_id))
            .eq('status', 'pending');

        if (ticketsError) {
            return res.status(500).json({ error: 'Failed to fetch tickets.' });
        }

        // Get active alerts and map with hub and project data
        const { data: activeAlerts, error: alertsError } = await supabase
            .from('alerts')
            .select('message, hub_id, created_at')
            .eq('active', true)
            .in('hub_id', hubs.map(hub => hub.hub_id))
            .order('created_at', { ascending: false })
            .limit(10);

        if (alertsError) {
            console.error('Alerts Error:', alertsError);
            return res.status(500).json({ error: 'Failed to fetch alerts.' });
        }

        // Map alerts to include hub and project information
        const alerts = activeAlerts.map(alert => {
            const hub = hubs.find(h => h.hub_id === alert.hub_id);
            const project = projects.find(p => p.proj_id === hub.proj_id);
            
            return {
                alertType: alert.message,
                unitAddress: project.address,
                unitNumber: `Unit ${hub.unit_number}`,
            };
        });

        // Format the response
        const response = {
            companyId: orgIds[0], // Using first org_id as company ID
            systemOverview: {
                projects: projects.length,
                totalUnits: hubs.length,
                pendingTickets: tickets.length,
                totalAdminUsers: uniqueAdminUsers.length,
            },
            alerts: alerts,
            systemHealth: systemHealth,  // Added system health stats
        };

        res.json(response);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};