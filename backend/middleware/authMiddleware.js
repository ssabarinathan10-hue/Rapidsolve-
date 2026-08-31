/**
 * RAPIDSOLVE — Admin Authentication Middleware
 * Validates admin bearer token or session token before granting access to protected routes.
 *
 * In Production: Strictly requires ADMIN_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD environment variables.
 * In Development: Loads from environment variables or .env file.
 */

function getAdminConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  const token = process.env.ADMIN_TOKEN;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (isProduction && (!token || !email || !password)) {
    console.error('[SECURITY ALERT] Required admin environment variables (ADMIN_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD) are missing in production mode.');
    return {
      isConfigured: false,
      token: null,
      email: null,
      password: null
    };
  }

  // Development defaults (only active when NODE_ENV !== 'production')
  return {
    isConfigured: true,
    token: token || 'dev_admin_token_rapidsolve_local',
    email: email || 'admin@rapidsolve.local',
    password: password || 'DevAdmin@2026'
  };
}

function requireAdmin(req, res, next) {
  const config = getAdminConfig();

  if (!config.isConfigured) {
    return res.status(500).json({
      success: false,
      message: 'Server security error: Admin authentication is not configured in production.',
      errors: ['Admin credentials must be set via environment variables in production.']
    });
  }

  const authHeader = req.headers['authorization'] || '';
  const customHeader = req.headers['x-admin-token'] || '';
  const queryToken = req.query.token || '';

  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  } else if (queryToken) {
    token = String(queryToken).trim();
  }

  if (!token || token !== config.token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication required',
      errors: ['Admin authentication required.']
    });
  }

  req.admin = { email: config.email, role: 'admin' };
  next();
}

module.exports = {
  requireAdmin,
  getAdminConfig
};
