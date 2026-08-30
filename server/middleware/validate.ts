import { Request, Response, NextFunction } from 'express';

export function validateChatInput(req: Request, res: Response, next: NextFunction) {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Validation Error: "prompt" is required and must be a string.' });
  }
  if (prompt.trim().length === 0 || prompt.length > 4000) {
    return res.status(400).json({ success: false, error: 'Validation Error: "prompt" must be between 1 and 4000 characters.' });
  }
  next();
}

export function validateDarkwebResearchInput(req: Request, res: Response, next: NextFunction) {
  const { query, justification } = req.body || {};
  if (!query || typeof query !== 'string' || query.trim().length < 3 || query.length > 200) {
    return res.status(400).json({ success: false, error: 'Validation Error: "query" is required (3-200 characters).' });
  }
  if (!justification || typeof justification !== 'string' || justification.trim().length < 10 || justification.length > 500) {
    return res.status(400).json({ success: false, error: 'Validation Error: "justification" is required (10-500 characters).' });
  }
  next();
}

export function validateTradingOrderInput(req: Request, res: Response, next: NextFunction) {
  const { symbol, side, amount } = req.body || {};
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ success: false, error: 'Validation Error: "symbol" is required (string).' });
  }
  if (side !== 'BUY' && side !== 'SELL') {
    return res.status(400).json({ success: false, error: 'Validation Error: "side" must be BUY or SELL.' });
  }
  const amtNum = Number(amount);
  if (isNaN(amtNum) || amtNum <= 0) {
    return res.status(400).json({ success: false, error: 'Validation Error: "amount" must be a positive number.' });
  }
  next();
}