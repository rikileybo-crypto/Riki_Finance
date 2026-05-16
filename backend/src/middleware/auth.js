import { createRemoteJWKSet, jwtVerify } from 'jose';

let _jwks = null;

function getJwks() {
  if (!_jwks) {
    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error('Missing SUPABASE_URL');
    _jwks = createRemoteJWKSet(new URL(`${url}/auth/v1/keys`));
  }
  return _jwks;
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      audience: 'authenticated',
    });
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}