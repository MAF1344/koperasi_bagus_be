import jwt from 'jsonwebtoken';

// Verify JWT Token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({message: 'Akses ditolak. Token tidak ditemukan.'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({message: 'Token tidak valid.'});
  }
};

// Check if user is SuperAdmin
export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({message: 'Akses ditolak. Hanya untuk Super Admin.'});
  }
  next();
};

// Check if user is Admin or SuperAdmin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({message: 'Akses ditolak. Hanya untuk Admin.'});
  }
  next();
};

// Check if user is authenticated (any role)
export const isAuthenticated = (req, res, next) => {
  // Already verified by verifyToken
  next();
};
