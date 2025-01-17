import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { burns, type InsertBurn } from "@db/schema";
import { eq } from "drizzle-orm";
import { recoverMessageAddress } from 'viem';

// Store challenges in memory (in production, use Redis or similar)
const challenges = new Map<string, { code: string, expiresAt: Date }>();

export function registerRoutes(app: Express): Server {
  // Burns API routes
  app.post('/api/v1/burns/register', async (req, res) => {
    try {
      const { tokenId, txHash } = req.body;

      const burn: InsertBurn = {
        tokenId,
        txHash,
      };

      const [result] = await db.insert(burns).values(burn).returning();
      res.json(result);
    } catch (error) {
      console.error('Failed to register burn:', error);
      res.status(500).json({ message: 'Failed to register burn' });
    }
  });

  app.get('/api/v1/burns', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;

      const [burnRecords, total] = await Promise.all([
        db.query.burns.findMany({
          limit,
          offset,
          orderBy: (burns, { desc }) => [desc(burns.timestamp)]
        }),
        db.query.burns.findMany().then(r => r.length)
      ]);

      res.json({
        data: burnRecords,
        pagination: {
          limit,
          page,
          total
        }
      });
    } catch (error) {
      console.error('Failed to fetch burns:', error);
      res.status(500).json({ message: 'Failed to fetch burns' });
    }
  });

  app.get('/api/v1/burns/:id', async (req, res) => {
    try {
      const burn = await db.query.burns.findFirst({
        where: (burns) => eq(burns.id, parseInt(req.params.id))
      });

      if (!burn) {
        return res.status(404).json({ message: 'Burn record not found' });
      }

      res.json(burn);
    } catch (error) {
      console.error('Failed to fetch burn record:', error);
      res.status(500).json({ message: 'Failed to fetch burn record' });
    }
  });

  // Auth routes
  app.post('/api/v1/auth/challenge', async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ message: 'Address is required' });
      }

      console.log('Generating challenge for address:', address);

      const nonce = Date.now().toString();
      const code = `Sign this message to authenticate with Phoenix NFT Burning\nNonce: ${nonce}`;
      const challenge = {
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        address
      };

      // Store the challenge
      challenges.set(address.toLowerCase(), {
        code,
        expiresAt: challenge.expiresAt
      });

      console.log('Challenge generated:', { address, nonce });
      res.json(challenge);
    } catch (error) {
      console.error('Failed to generate challenge:', error);
      res.status(500).json({ message: 'Failed to generate challenge' });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { address, signature, chain } = req.body;
      if (!address || !signature || !chain) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      console.log('Login attempt:', { address, chain });

      // Get stored challenge
      const storedChallenge = challenges.get(address.toLowerCase());
      if (!storedChallenge) {
        console.error('No challenge found for address:', address);
        return res.status(401).json({ message: 'No challenge found, please request a new one' });
      }

      if (storedChallenge.expiresAt < new Date()) {
        console.error('Challenge expired for address:', address);
        challenges.delete(address.toLowerCase());
        return res.status(401).json({ message: 'Challenge expired, please request a new one' });
      }

      // Verify the signature
      const recoveredAddress = await recoverMessageAddress({
        message: storedChallenge.code,
        signature,
      });

      console.log('Signature verification:', {
        recoveredAddress,
        originalAddress: address,
        matches: recoveredAddress.toLowerCase() === address.toLowerCase()
      });

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ message: 'Invalid signature' });
      }

      // Clear used challenge
      challenges.delete(address.toLowerCase());

      // Generate a simple JWT-like token
      const token = Buffer.from(JSON.stringify({
        address,
        chain,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })).toString('base64');

      console.log('Authentication successful for address:', address);
      res.json({ accessToken: token });
    } catch (error) {
      console.error('Authentication failed:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}