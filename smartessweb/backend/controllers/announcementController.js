const supabase = require('../config/supabase');

exports.getAllHubUserEmailsInOrg = async (req, res) => {
  try {
    const { orgId } = req.params;

    const { data: projects, error: projectError } = await supabase
      .from('project')
      .select('proj_id')
      .eq('org_id', orgId);

    if (projectError) {
      return res.status(500).json({ error: 'Failed to fetch projects.' });
    }

    if (!projects || projects.length === 0) {
      return res.json({ emails: [] });
    }

    const projectIds = projects.map((p) => p.proj_id);

    const { data: hubs, error: hubError } = await supabase
      .from('hub')
      .select('hub_id')
      .in('proj_id', projectIds);

    if (hubError) {
      return res.status(500).json({ error: 'Failed to fetch hubs.' });
    }

    if (!hubs || hubs.length === 0) {
      return res.json({ emails: [] });
    }

    const hubIds = hubs.map((h) => h.hub_id);

    const { data: hubUsers, error: hubUserError } = await supabase
      .from('hub_user')
      .select('user_id')
      .in('hub_id', hubIds);

    if (hubUserError) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch hub_user entries.' });
    }

    if (!hubUsers || hubUsers.length === 0) {
      return res.json({ emails: [] });
    }

    const userIds = hubUsers.map((hu) => hu.user_id);

    // Step 4: Grab the user records, focusing on distinct emails
    const { data: users, error: userError } = await supabase
      .from('user')
      .select('user_id, email')
      .in('user_id', userIds);

    if (userError) {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }

    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));

    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getAllHubUserEmailsInProject = async (req, res) => {
  try {
    const { projId } = req.params;

    const { data: hubs, error: hubError } = await supabase
      .from('hub')
      .select('hub_id')
      .eq('proj_id', projId);

    if (hubError) {
      return res.status(500).json({ error: 'Failed to fetch hubs.' });
    }

    if (!hubs || hubs.length === 0) {
      return res.json({ emails: [] });
    }

    const hubIds = hubs.map((h) => h.hub_id);

    const { data: hubUsers, error: hubUserError } = await supabase
      .from('hub_user')
      .select('user_id')
      .in('hub_id', hubIds);

    if (hubUserError) {
      return res.status(500).json({ error: 'Failed to fetch hub_user data.' });
    }

    if (!hubUsers || hubUsers.length === 0) {
      return res.json({ emails: [] });
    }

    const userIds = hubUsers.map((hu) => hu.user_id);

    const { data: users, error: userError } = await supabase
      .from('user')
      .select('email')
      .in('user_id', userIds);

    if (userError) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch user information.' });
    }

    const uniqueEmails = Array.from(new Set(users.map((u) => u.email)));

    return res.json({ emails: uniqueEmails });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
