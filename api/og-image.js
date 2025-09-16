export default async function handler(req, res) {
  const { event = 'You\'re Invited!', date = '', location = '' } = req.query;
  
  // Create SVG image with invitation details
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Card -->
      <rect x="100" y="100" width="1000" height="430" rx="20" fill="white" opacity="0.95"/>
      
      <!-- Title -->
      <text x="600" y="200" font-family="Georgia, serif" font-size="48" font-weight="600" text-anchor="middle" fill="#333">
        You're Cordially Invited
      </text>
      
      <!-- Event Name -->
      <text x="600" y="300" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="#555">
        ${escapeXml(event)}
      </text>
      
      <!-- Date -->
      ${date ? `<text x="600" y="380" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#777">${escapeXml(date)}</text>` : ''}
      
      <!-- Location -->
      ${location ? `<text x="600" y="430" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#777">${escapeXml(location)}</text>` : ''}
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.status(200).send(svg);
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}