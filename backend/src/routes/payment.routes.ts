import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { telebirrService } from '../services/telebirrService.js';
import { query } from '../config/database.js';
import { SubscriptionPlan } from '../types/domain.js';

// Strict server-side pricing catalog (telebirr only)
// 1. Coin Pack: 10 coins for 10 ETB (enables 5 tournament plays at 2 coins each)
// 2. VIP Plans: Daily 10 ETB, Weekly 25 ETB, Monthly 50 ETB
interface ValidCatalogItem {
  itemType: 'COIN_PACK' | 'VIP_SUBSCRIPTION';
  amountETB: number;
  itemTitle: string;
  coinsReward?: number;
  subscriptionPlan?: SubscriptionPlan;
}

const PRICING_CATALOG: Record<string, ValidCatalogItem> = {
  COIN_PACK_10: {
    itemType: 'COIN_PACK',
    amountETB: 10,
    itemTitle: '10 GoPlay Coins (5 Tournament Plays)',
    coinsReward: 10,
  },
  COIN_PACK_30: {
    itemType: 'COIN_PACK',
    amountETB: 30,
    itemTitle: '30 GoPlay Coins (15 Tournament Plays)',
    coinsReward: 30,
  },
  COIN_PACK_50: {
    itemType: 'COIN_PACK',
    amountETB: 50,
    itemTitle: '50 GoPlay Coins (25 Tournament Plays)',
    coinsReward: 50,
  },
  PLAN_DAILY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 10,
    itemTitle: 'Daily VIP Pass (10 ETB)',
    subscriptionPlan: 'daily',
  },
  PLAN_WEEKLY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 25,
    itemTitle: 'Weekly VIP Pass (25 ETB)',
    subscriptionPlan: 'weekly',
  },
  PLAN_MONTHLY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 50,
    itemTitle: 'Monthly VIP Pass (50 ETB)',
    subscriptionPlan: 'monthly',
  },
};

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Process / Initiate payment strictly via Telebirr with server-side catalog enforcement
  fastify.post('/process', async (request, reply) => {
    const userId = request.user!.userId;
    const phone = request.user!.phone;
    const body = (request.body || {}) as {
      packageId?: string;
      itemType?: 'VIP_SUBSCRIPTION' | 'COIN_PACK';
      plan?: SubscriptionPlan;
    };

    // Determine catalog item securely
    let catalogItem: ValidCatalogItem | undefined;

    if (body.packageId && PRICING_CATALOG[body.packageId]) {
      catalogItem = PRICING_CATALOG[body.packageId];
    } else if (body.itemType === 'COIN_PACK') {
      catalogItem = PRICING_CATALOG.COIN_PACK_10;
    } else if (body.itemType === 'VIP_SUBSCRIPTION') {
      if (body.plan === 'daily') catalogItem = PRICING_CATALOG.PLAN_DAILY;
      else if (body.plan === 'weekly') catalogItem = PRICING_CATALOG.PLAN_WEEKLY;
      else if (body.plan === 'monthly') catalogItem = PRICING_CATALOG.PLAN_MONTHLY;
    }

    if (!catalogItem) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid purchase package. Please select a valid TeleBirr coin pack or VIP plan.',
      });
    }

    const result = await telebirrService.initiatePayment({
      userId,
      phone,
      amountETB: catalogItem.amountETB,
      itemType: catalogItem.itemType,
      itemTitle: catalogItem.itemTitle,
      coinsReward: catalogItem.coinsReward,
      subscriptionPlan: catalogItem.subscriptionPlan,
    });

    return reply.send({
      status: result.status,
      transaction: {
        transactionId: result.orderId,
        method: 'TELEBIRR',
        amountETB: catalogItem.amountETB,
        itemType: catalogItem.itemType,
        itemTitle: catalogItem.itemTitle,
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
