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
    <meta property="og:image" content="https://${req.headers.host}/invitation-preview.png" />
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
    
    // Handle both old format and new format with fields array
    let fields = data.fields || [];
    
    // Helper to get field value
    const getFieldValue = (field) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object' && field.value) return field.value;
      return '';
    };
    
    // If data is in old format, convert it
    if (fields.length === 0) {
      // Old format - build fields array from direct properties
      const oldEvent = getFieldValue(data.event);
      const oldFrom = getFieldValue(data.from);
      const oldLocation = getFieldValue(data.location);
      const oldDate = getFieldValue(data.date);
      const oldTime = getFieldValue(data.time);
      
      fields = [
        { id: 'event', value: oldEvent, visible: true },
        { id: 'from', value: oldFrom, visible: !!oldFrom },
        { id: 'location', value: oldLocation, visible: !!oldLocation },
        { id: 'date', value: oldDate, visible: !!oldDate },
        { id: 'time', value: oldTime, visible: !!oldTime }
      ];
    }
    
    // Extract values from fields array
    const getFieldById = (id) => {
      const field = fields.find(f => f.id === id && f.visible !== false);
      return field?.value || '';
    };
    
    const event = getFieldById('event') || 'an event';
    const from = getFieldById('from');
    const location = getFieldById('location');
    const date = getFieldById('date');
    const time = getFieldById('time');
    
    // Build title and description
    const title = "You've got mail";
    let description = `You received an invitation to ${event}`;
    
    // Add more details to description if available
    if (from) {
      description += ` from ${from}`;
    }
    if (date || time) {
      const when = [];
      if (date) when.push(date);
      if (time) when.push(`at ${time}`);
      if (when.length > 0) {
        description += ` • ${when.join(' ')}`;
      }
    }
    if (location) {
      description += ` • ${location}`;
    }
    
    // Truncate description for social media limits
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    const pageUrl = `https://${req.headers.host}/invite/${id}`;
    const imageUrl = `https://${req.headers.host}/invitation-preview.png`;
    
    // Generate the HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:site_name" content="Invites" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
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
        background: #f9fafb;
      }
      .loading {
        text-align: center;
        color: #111827;
      }
      .spinner {
        border: 3px solid rgba(16, 185, 129, 0.2);
        border-radius: 50%;
        border-top: 3px solid #10b981;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      h2 {
        color: #064e3b;
        font-size: 2rem;
        margin: 1rem 0;
      }
      p {
        color: #6b7280;
        margin: 0.5rem 0;
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
    <title>You've got mail</title>
    <meta name="description" content="You received an invitation. Click to view details." />
    <meta property="og:title" content="You've got mail" />
    <meta property="og:description" content="You received an invitation. Click to view details." />
    <meta property="og:image" content="https://${req.headers.host}/invitation-preview.png" />
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