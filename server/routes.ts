import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { burns, type InsertBurn } from "@db/schema";
import { eq } from "drizzle-orm";

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

  const httpServer = createServer(app);
  return httpServer;
}