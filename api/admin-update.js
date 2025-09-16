/* eslint-env node */
// API endpoint to update default invitation template (admin only)
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check authentication
  const userEmail = req.headers['x-vercel-authenticated-user'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user is admin
  // eslint-disable-next-line no-undef
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes(userEmail.toLowerCase());
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const { templateData, updateType } = req.body;
    
    if (!templateData || !updateType) {
      return res.status(400).json({ error: 'Missing template data or update type' });
    }
    
    // Update Firebase with new template
    const firebaseUrl = 'https://invites-75e19-default-rtdb.firebaseio.com';
    
    let updateUrl;
    switch (updateType) {
      case 'defaultTemplate':
        updateUrl = `${firebaseUrl}/settings/defaultTemplate.json`;
        break;
      case 'protectedFields':
        updateUrl = `${firebaseUrl}/settings/protectedFields.json`;
        break;
      case 'fieldDefinitions':
        updateUrl = `${firebaseUrl}/settings/fieldDefinitions.json`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid update type' });
    }
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...templateData,
        lastUpdatedBy: userEmail,
        lastUpdatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update Firebase');
    }
    
    const result = await response.json();
    
    return res.status(200).json({
      success: true,
      message: `${updateType} updated successfully`,
      updatedBy: userEmail,
      data: result
    });
    
  } catch (error) {
    console.error('Admin update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update template',
      details: error.message 
    });
  }
}