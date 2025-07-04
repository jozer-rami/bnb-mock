import { Request, Response } from 'express';

export const indexController = (req: Request, res: Response): void => {
  res.json({
    message: 'Welcome to BNB Mock Server',
    description: 'A TypeScript Express server with BNB API endpoints',
    version: '1.0.0',
    endpoints: {
      root: '/',
      health: '/health',
      api: '/api/v1',
      bnb: {
        auth: '/ClientAuthentication.API/api/v1/auth/token',
        transaction: '/DirectDebit/GetTransactionOutgoing/:referenceId'
      }
    },
    timestamp: new Date().toISOString()
  });
}; 