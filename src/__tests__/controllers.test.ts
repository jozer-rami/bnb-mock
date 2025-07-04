import { Request, Response } from 'express';
import { getAuthToken, getTransactionOutgoing, authMiddleware } from '../controllers/bnbControllers';

// Mock Express Request and Response
const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  headers: {},
  ...overrides,
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

const createMockNext = () => jest.fn();

describe('BNB Controllers', () => {
  describe('getAuthToken', () => {
    it('should return access token for valid client_credentials', () => {
      const req = createMockRequest({
        body: { grant_type: 'client_credentials' }
      }) as Request;
      const res = createMockResponse() as Response;

      getAuthToken(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: expect.any(String),
          token_type: 'bearer',
          expires_in: 3600,
        })
      );
    });

    it('should return 400 for unsupported grant_type', () => {
      const req = createMockRequest({
        body: { grant_type: 'password' }
      }) as Request;
      const res = createMockResponse() as Response;

      getAuthToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unsupported grant_type'
      });
    });

    it('should return 400 for missing grant_type', () => {
      const req = createMockRequest({ body: {} }) as Request;
      const res = createMockResponse() as Response;

      getAuthToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unsupported grant_type'
      });
    });
  });

  describe('getTransactionOutgoing', () => {
    it('should return SUCCESS payment for REF123', () => {
      const req = createMockRequest({
        params: { referenceId: 'REF123' }
      }) as Request;
      const res = createMockResponse() as Response;

      getTransactionOutgoing(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceId: 'REF123',
          status: 'SUCCESS',
          amount: 120.5,
          payerAlias: '7700-123-456',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return NOT_FOUND payment for REF404', () => {
      const req = createMockRequest({
        params: { referenceId: 'REF404' }
      }) as Request;
      const res = createMockResponse() as Response;

      getTransactionOutgoing(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceId: 'REF404',
          status: 'NOT_FOUND',
          amount: 0,
          payerAlias: '',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return 404 for unknown reference ID', () => {
      const req = createMockRequest({
        params: { referenceId: 'UNKNOWN123' }
      }) as Request;
      const res = createMockResponse() as Response;

      getTransactionOutgoing(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        referenceId: 'UNKNOWN123',
        status: 'NOT_FOUND',
      });
    });
  });

  describe('authMiddleware', () => {
    it('should call next() for valid bearer token', () => {
      // First get a valid token
      const authReq = createMockRequest({
        body: { grant_type: 'client_credentials' }
      }) as Request;
      const authRes = createMockResponse() as Response;
      
      getAuthToken(authReq, authRes);
      const token = (authRes.json as jest.Mock).mock.calls[0][0].access_token;

      // Test middleware with valid token
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 for missing Authorization header', () => {
      const req = createMockRequest({}) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing bearer token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid Authorization format', () => {
      const req = createMockRequest({
        headers: { authorization: 'InvalidFormat token123' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing bearer token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid-token' }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 