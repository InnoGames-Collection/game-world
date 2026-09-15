import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { telebirrService } from '../services/telebirrService.js';
import { query } from '../config/database.js';

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Process / Initiate payment
  fastify.post('/process', async (request, reply) => {
    const userId = request.user!.userId;
    const phone = request.user!.phone;
    const body = request.body as {
      method: 'TELEBIRR' | 'ETHIO_AIRTIME' | 'USSD_CARRIER';
      amountETB: number;
      itemType: 'ENERGY_PACK' | 'VIP_SUBSCRIPTION' | 'TOURNAMENT_BUYIN' | 'COIN_PACK';
      itemTitle: string;
      coinsReward?: number;
    };

    if (!body.amountETB || !body.itemType) {
      return reply.status(400).send({ success: false, message: 'Invalid payment parameters' });
    }

    const result = await telebirrService.initiatePayment({
      userId,
      phone,
      amountETB: body.amountETB,
      itemType: body.itemType,
      itemTitle: body.itemTitle,
      coinsReward: body.coinsReward,
    });

    return reply.send({
      status: result.status,
      transaction: {
        transactionId: result.orderId,
        method: body.method,
        amountETB: body.amountETB,
        itemType: body.itemType,
        itemTitle: body.itemTitle,
        status: result.status,
        timestamp: new Date().toISOString(),
      },
      checkoutUrl: result.checkoutUrl,
      message: result.message,
    });
  });

  // Get payment history
  fastify.get('/history', async (request, reply) => {
    const userId = request.user!.userId;
    const res = await query(
      `SELECT id, method, amount_etb, item_type, item_title, status, created_at, msisdn_masked
         FROM payment_orders
        WHERE user_id = $1
        ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    return reply.send(
      res.rows.map((r: any) => ({
        transactionId: r.id,
        method: r.method,
        amountETB: parseFloat(r.amount_etb),
        itemType: r.item_type,
        itemTitle: r.item_title,
        status: r.status,
        timestamp: r.created_at,
        msisdnMasked: r.msisdn_masked,
      }))
    );
  });
}
