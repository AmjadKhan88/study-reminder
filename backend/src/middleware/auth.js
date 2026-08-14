const { verifyAccessToken } = require('../utils/tokens');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing access token' });
  }
  try {
    const payload = verifyAccessToken(header.split(' ')[1]);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};