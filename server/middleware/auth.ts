import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../db';
import { User, Admin } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'veyra_jwt_secret_production_key_49281';

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
  admin?: Omit<Admin, 'passwordHash'>;
}

export function generateToken(payload: { id: string; email: string; role: 'customer' | 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please login.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    if (decoded.role !== 'customer') {
      res.status(403).json({ error: 'Invalid authorization credentials.' });
      return;
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User account not found or has been deactivated.' });
      return;
    }

    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authorization required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name?: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
      return;
    }

    req.admin = {
      _id: decoded.id,
      name: decoded.name || 'System Admin',
      email: decoded.email,
      createdAt: new Date().toISOString(),
      role: 'admin'
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Admin session invalid or expired.' });
  }
}

export async function optionalUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      if (decoded.role === 'customer') {
        const user = await findUserById(decoded.id);
        if (user) {
          const { passwordHash, ...safeUser } = user;
          req.user = safeUser;
        }
      }
    } catch {
      // Ignored for optional
    }
  }
  next();
}
