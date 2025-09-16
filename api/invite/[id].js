export default async function handler(req, res) {
  const { id } = req.query;
  
  // Fetch invite data from Firebase
  const firebaseUrl = `https://invites-75e19-default-rtdb.firebaseio.com/invites/${id}.json`;
  
  try {
    const response = await fetch(firebaseUrl);
    const inviteData = await response.json();
    
    if (!inviteData) {
      // Return default HTML if invite not found
      return res.status(200).send(getDefaultHTML());
    }
    
    // Generate HTML with dynamic meta tags
    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Dynamic Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Invitation: ${inviteData.event || 'Special Event'}" />
    <meta property="og:description" content="${inviteData.date || 'Date TBD'} at ${inviteData.time || 'Time TBD'} - ${inviteData.location || 'Location TBD'}" />
    <meta property="og:image" content="https://invite-react.vercel.app/api/og-image?event=${encodeURIComponent(inviteData.event || '')}" />
    <meta property="og:url" content="https://invite-react.vercel.app/invite/${id}" />
    
    <!-- Dynamic Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="Invitation: ${inviteData.event || 'Special Event'}" />
    <meta property="twitter:description" content="${inviteData.date || 'Date TBD'} at ${inviteData.time || 'Time TBD'}" />
    <meta property="twitter:image" content="https://invite-react.vercel.app/api/og-image?event=${encodeURIComponent(inviteData.event || '')}" />
    
    <title>${inviteData.event || 'Invitation'}</title>
  </head>
  <body>
    <div id="root"></div>
    <script>window.__INVITE_DATA__ = ${JSON.stringify(inviteData)};</script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    res.status(200).send(getDefaultHTML());
  }
}

function getDefaultHTML() {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="You're Invited!" />
    <meta property="og:description" content="View your invitation" />
    <title>Invitation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
}