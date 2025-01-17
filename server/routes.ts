import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { burns, type InsertBurn } from "@db/schema";
import { eq } from "drizzle-orm";
import { recoverMessageAddress } from 'viem';

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

      const code = `Sign this message to authenticate with Phoenix NFT Burning\nNonce: ${Date.now()}`;
      const challenge = {
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        address
      };

      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate challenge' });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { address, signature, chain } = req.body;
      if (!address || !signature || !chain) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify the signature
      const message = `Sign this message to authenticate with Phoenix NFT Burning\nNonce: ${Date.now()}`;
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature,
      });

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ message: 'Invalid signature' });
      }

      // Generate a simple JWT-like token (in production, use a proper JWT library)
      const token = Buffer.from(JSON.stringify({
        address,
        chain,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })).toString('base64');

      res.json({ accessToken: token });
    } catch (error) {
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}