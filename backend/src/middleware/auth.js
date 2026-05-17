import { jwtVerify } from 'jose';

export async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Missing SUPABASE_JWT_SECRET' });

  try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        req.user = { id: payload.sub, email: payload.email };
        next();
  } catch (err) {
        console.error('Auth error:', err.message);
        res.status(401).json({ error: 'Invalid token' });
  }
}
