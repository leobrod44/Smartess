const supabase = require('../config/supabase');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

exports.sendAnnouncementEmail = async (req, res) => {
  const { emailList, type, selectedAddress, content, keywords, files } =
    req.body;

  const subject = `Smartess Announcement: ${
    type === 'organization' ? 'Organization Update' : 'Project Update'
  }`;

  const htmlContent = `
    <h1>${
      type === 'organization'
        ? 'Organization Announcement'
        : 'Project Announcement'
    }</h1>
    <p>${content}</p>
    ${
      type === 'project' && selectedAddress
        ? `<p><strong>Selected Address:</strong> ${selectedAddress}</p>`
        : ''
    }
    ${
      keywords && keywords.length > 0
        ? `<p><strong>Keywords:</strong> ${keywords.join(', ')}</p>`
        : ''
    }
    ${
      files && files.length > 0
        ? `<p><strong>Attached Files:</strong> ${files.join(', ')}</p>`
        : ''
    }
  `;

  try {
    for (const email of emailList) {
      console.log(`Sending email to: ${email}...`);

      await resend.emails.send({
        from: `Smartess <support@${process.env.RESEND_DOMAIN}>`,
        to: email,
        subject,
        html: htmlContent,
      });
    }

    return res.status(200).json({
      message: 'All emails sent successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send emails.',
      error: error.message,
    });
  }
};
