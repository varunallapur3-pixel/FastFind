import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_jwt_key_99';

// Login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const token = jwt.sign({ email, role: 'operator' }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: {
      id: 'usr_cyber_99',
      name: email.split('@')[0].toUpperCase() || 'CYBER OPERATOR',
      email,
    },
    token,
  });
});

// Signup
authRouter.post('/signup', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const token = jwt.sign({ email, role: 'operator' }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: {
      id: 'usr_cyber_' + Math.floor(Math.random() * 1000),
      name: name.toUpperCase(),
      email,
    },
    token,
  });
});
