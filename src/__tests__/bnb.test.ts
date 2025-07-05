import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { getAuthToken, getTransactionOutgoing, authMiddleware } from '../controllers/bnbControllers';

// Create a test app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Test routes
app.post('/ClientAuthentication.API/api/v1/auth/token', getAuthToken);
app.get('/DirectDebit/GetTransactionOutgoing/:referenceId', authMiddleware, getTransactionOutgoing);

describe('BNB API Endpoints', () => {
  let validToken: string;

  describe('POST /ClientAuthentication.API/api/v1/auth/token', () => {
    it('should return access token for valid client_credentials grant_type', async () => {
      const response = await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({ grant_type: 'client_credentials' })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'bearer');
      expect(response.body).toHaveProperty('expires_in', 86400);
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(0);

      // Store token for other tests
      validToken = response.body.access_token;
    });

    it('should return 400 for unsupported grant_type', async () => {
      const response = await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({ grant_type: 'password' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Unsupported grant_type');
    });

    it('should return 400 for missing grant_type', async () => {
      const response = await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Unsupported grant_type');
    });

    it('should return 400 for empty grant_type', async () => {
      const response = await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({ grant_type: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Unsupported grant_type');
    });
  });

  describe('GET /DirectDebit/GetTransactionOutgoing/:referenceId', () => {
    beforeEach(async () => {
      // Ensure we have a valid token for each test
      if (!validToken) {
        const authResponse = await request(app)
          .post('/ClientAuthentication.API/api/v1/auth/token')
          .send({ grant_type: 'client_credentials' });
        validToken = authResponse.body.access_token;
      }
    });

    it('should return SUCCESS payment for REF123', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        referenceId: 'REF123',
        status: 'SUCCESS',
        amount: 120.5,
        payerAlias: '7700-123-456',
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return NOT_FOUND payment for REF404', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF404')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        referenceId: 'REF404',
        status: 'NOT_FOUND',
        amount: 0,
        payerAlias: '',
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 404 for unknown reference ID', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/UNKNOWN123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        referenceId: 'UNKNOWN123',
        status: 'NOT_FOUND',
      });
    });

    it('should return SUCCESS for P2P reference IDs', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/P2P123456')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        referenceId: 'P2P123456',
        status: 'SUCCESS',
        amount: 100.0,
        payerAlias: 'P2P-USER-123456',
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return SUCCESS for different P2P reference IDs', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/P2PABC')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        referenceId: 'P2PABC',
        status: 'SUCCESS',
        amount: 100.0,
        payerAlias: 'P2P-USER-ABC',
      });
    });

    it('should return 401 for missing Authorization header', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing bearer token');
    });

    it('should return 401 for invalid Authorization header format', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Missing bearer token');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should return 401 for expired token', async () => {
      // Create a token that expires immediately
      const expiredToken = 'expired-token-' + Date.now();
      
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should handle special characters in reference ID', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF-123_456')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        referenceId: 'REF-123_456',
        status: 'NOT_FOUND',
      });
    });

    it('should handle empty reference ID', async () => {
      const response = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      // Express returns an empty object for unmatched routes
      expect(response.body).toEqual({});
    });
  });

  describe('Integration Tests', () => {
    it('should work with fresh token for multiple requests', async () => {
      // Get a fresh token
      const authResponse = await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({ grant_type: 'client_credentials' })
        .expect(200);

      const freshToken = authResponse.body.access_token;

      // Use the token for multiple requests
      const response1 = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF123')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(200);

      const response2 = await request(app)
        .get('/DirectDebit/GetTransactionOutgoing/REF404')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(200);

      expect(response1.body.status).toBe('SUCCESS');
      expect(response2.body.status).toBe('NOT_FOUND');
    });

    it('should handle concurrent requests with same token', async () => {
      const token = validToken || (await request(app)
        .post('/ClientAuthentication.API/api/v1/auth/token')
        .send({ grant_type: 'client_credentials' })).body.access_token;

      const promises = [
        request(app)
          .get('/DirectDebit/GetTransactionOutgoing/REF123')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .get('/DirectDebit/GetTransactionOutgoing/REF404')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .get('/DirectDebit/GetTransactionOutgoing/UNKNOWN')
          .set('Authorization', `Bearer ${token}`),
      ];

      const responses = await Promise.all(promises);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(404);
    });
  });
}); 