/* eslint-env node */
// API endpoint to check if current user is an admin
export default async function handler(req, res) {
  // Get the user email from Vercel authentication headers
  // Vercel adds x-vercel-authenticated-user when authentication is enabled
  const userEmail = req.headers['x-vercel-authenticated-user'];
  
  if (!userEmail) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      isAdmin: false 
    });
  }
  
  // Get admin emails from environment variable
  // Set ADMIN_EMAILS in Vercel dashboard: "email1@example.com,email2@example.com"
  // eslint-disable-next-line no-undef
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  
  const isAdmin = adminEmails.includes(userEmail.toLowerCase());
  
  return res.status(200).json({
    user: userEmail,
    isAdmin,
    message: isAdmin ? 'Admin access granted' : 'Regular user access'
  });
}