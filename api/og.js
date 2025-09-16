// Vercel Edge Function for generating Open Graph meta tags
export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  
  // Check if this is a crawler request
  const isBot = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|Discordbot|TelegramBot/i.test(userAgent);
  
  // For non-bot requests without ID or non-bot requests in general,
  // we should NOT handle them here - let Vercel's rewrite rules handle the React app
  if (!isBot) {
    // Return 404 so Vercel's rewrite rule kicks in
    return res.status(404).send('Not found');
  }
  
  // If no ID for a bot, return error
  if (!id) {
    return res.status(400).send('Invalid invitation URL');
  }
  
  try {
    // Fetch invitation data from Firebase
    const firebaseUrl = `https://invites-75e19-default-rtdb.firebaseio.com/invites/${id}.json`;
    const response = await fetch(firebaseUrl);
    
    if (!response.ok) {
      throw new Error('Invitation not found');
    }
    
    const data = await response.json();
    
    if (!data) {
      // Return proper 404 for non-existent invitations
      const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invitation Not Found</title>
    <meta name="description" content="This invitation doesn't exist or may have been removed." />
    <meta property="og:title" content="Invitation Not Found" />
    <meta property="og:description" content="This invitation doesn't exist or may have been removed." />
    <meta property="og:image" content="https://${req.headers.host}/logo_512x512.png" />
    <meta property="og:url" content="https://${req.headers.host}/invite/${id}" />
</head>
<body>
    <p>Invitation not found</p>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(404).send(html404);
      return;
    }
    
    // Extract and sanitize the data
    const escapeHtml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    
    // Handle both old format (simple strings) and new format (objects with value property)
    const getFieldValue = (field) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object' && field.value) return field.value;
      return '';
    };
    
    const title = getFieldValue(data.title) || 'You are Cordially Invited';
    const event = getFieldValue(data.event) || 'Special Event';
    const from = getFieldValue(data.from) || '';
    const location = getFieldValue(data.location) || '';
    const date = getFieldValue(data.date) || '';
    const time = getFieldValue(data.time) || '';
    const footer = getFieldValue(data.footer) || '';
    
    // Build more specific description based on available fields
    let description = '';
    
    // Add event name
    if (event && event !== 'Special Event') {
      description = event;
    }
    
    // Add from information if available
    if (from) {
      description = description ? `${description} - From ${from}` : `From ${from}`;
    }
    
    // Add date and time
    if (date || time) {
      const dateTime = date + (time ? ` at ${time}` : '');
      description = description ? `${description} | ${dateTime}` : dateTime;
    }
    
    // Add location
    if (location) {
      description = description ? `${description} | ${location}` : location;
    }
    
    // Add footer if there's room
    if (footer && description.length + footer.length < 150) {
      description = description ? `${description}. ${footer}` : footer;
    }
    
    // Ensure we have a description
    if (!description) {
      description = 'You are invited to a special event. Click to view details.';
    }
    
    // Truncate description for social media limits
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    const pageUrl = `https://${req.headers.host}/invite/${id}`;
    const imageUrl = `https://${req.headers.host}/logo_512x512.png`;
    
    // Generate the HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(event)} - Invitation</title>
    <meta name="title" content="${escapeHtml(event)} - Invitation" />
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(event)} - Invitation" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:site_name" content="Invitation App" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${escapeHtml(event)} - Invitation" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Additional Tags -->
    <meta property="og:updated_time" content="${data.createdAt || new Date().toISOString()}" />
    <link rel="canonical" href="${pageUrl}" />
    
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .loading {
        text-align: center;
        color: white;
      }
      .spinner {
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 3px solid white;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(event)}</p>
        ${from ? `<p>From: ${escapeHtml(from)}</p>` : ''}
        <p>Loading invitation details...</p>
    </div>
</body>
</html>`;
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error generating OG tags:', error);
    
    // Fallback to generic page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You're Invited!</title>
    <meta name="description" content="You have received a special invitation. Click to view details." />
    <meta property="og:title" content="You're Invited!" />
    <meta property="og:description" content="You have received a special invitation. Click to view details." />
    <meta property="og:image" content="https://${req.headers.host}/logo_512x512.png" />
    <meta property="og:url" content="https://${req.headers.host}/" />
</head>
<body>
    <p>Invitation not found</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(404).send(html);
  }
}