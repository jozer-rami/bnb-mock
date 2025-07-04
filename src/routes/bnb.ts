import express from 'express';
import { 
  getAuthToken, 
  getTransactionOutgoing, 
  authMiddleware 
} from '../controllers/bnbControllers';

const router = express.Router();

/**
 * POST /ClientAuthentication.API/api/v1/auth/token
 * Mimics BNB OAuth2 client-credentials flow.
 * Expects: client_id, client_secret, grant_type=client_credentials (form-urlencoded)
 * Returns: access_token, token_type=bearer, expires_in (secs)
 */
router.post('/ClientAuthentication.API/api/v1/auth/token', getAuthToken);

/**
 * GET /DirectDebit/GetTransactionOutgoing/:referenceId
 * Checks payment status.
 * Requires: Authorization: Bearer <token>
 * Returns 404 if unknown referenceId.
 */
router.get(
  '/DirectDebit/GetTransactionOutgoing/:referenceId',
  authMiddleware,
  getTransactionOutgoing
);

export default router; 