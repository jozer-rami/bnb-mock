import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

interface TokenInfo {
  token: string;
  expiresAt: number;
}

interface Payment {
  referenceId: string;
  status: "SUCCESS" | "PENDING" | "NOT_FOUND" | "REJECTED";
  amount: number;
  payerAlias: string;
  timestamp: string;
}

// Token storage
const TOKENS: Map<string, TokenInfo> = new Map();

// Hard-coded demo payment data
const PAYMENTS: Record<string, Payment> = {
  "REF123": {
    referenceId: "REF123",
    status: "SUCCESS",
    amount: 120.5,
    payerAlias: "7700-123-456",
    timestamp: new Date().toISOString(),
  },
  "REF404": {
    referenceId: "REF404",
    status: "NOT_FOUND",
    amount: 0,
    payerAlias: "",
    timestamp: new Date().toISOString(),
  },
};

// Authentication middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  const tokenInfo = TOKENS.get(token);
  if (!tokenInfo || tokenInfo.expiresAt < Date.now()) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
};

// Authentication token endpoint
export const getAuthToken = (req: Request, res: Response): void => {
  const { grant_type } = req.body;
  if (grant_type !== "client_credentials") {
    res.status(400).json({ error: "Unsupported grant_type" });
    return;
  }
  
  // Skipping real client validation – this is a mock
  const token = uuid();
  const expiresIn = 86400; // 1 day (24 hours)
  TOKENS.set(token, { token, expiresAt: Date.now() + expiresIn * 1000 });
  
  res.json({
    access_token: token,
    token_type: "bearer",
    expires_in: expiresIn,
  });
};

// Get transaction status endpoint
export const getTransactionOutgoing = (req: Request, res: Response): void => {
  const { referenceId } = req.params;
  
  // Testing phase logic: P2P references return SUCCESS, others return NOT_FOUND
  if (referenceId.startsWith('P2P')) {
    const successPayment: Payment = {
      referenceId: referenceId,
      status: "SUCCESS",
      amount: 100.0, // Default amount for P2P transactions
      payerAlias: "P2P-USER-" + referenceId.slice(3), // Generate payer alias from reference
      timestamp: new Date().toISOString(),
    };
    res.json(successPayment);
    return;
  }
  
  // For non-P2P references, check if it exists in hardcoded data first
  const payment = PAYMENTS[referenceId];
  if (payment) {
    res.json(payment);
    return;
  }
  
  // If not found in hardcoded data, return NOT_FOUND
  res.status(404).json({ referenceId, status: "NOT_FOUND" });
}; 