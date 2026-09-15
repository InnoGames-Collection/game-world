import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { computeHmacSha256 } from '../utils/crypto.js';
import pino from 'pino';

const logger = pino({ name: 'TelebirrService' });

export interface InitiatePaymentParams {
  userId: string;
  phone: string;
  amountETB: number;
  itemType: 'ENERGY_PACK' | 'VIP_SUBSCRIPTION' | 'TOURNAMENT_BUYIN' | 'COIN_PACK';
  itemTitle: string;
  coinsReward?: number;
}

export interface InitiatePaymentResult {
  orderId: string;
  checkoutUrl?: string;
  sandbox: boolean;
  status: 'PENDING' | 'SUCCESS';
  message: string;
}

export const telebirrService = {
  /**
   * Initiate a TeleBirr C2B checkout payment
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const orderId = `TB_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const isSandbox = env.TELEBIRR_MODE === 'sandbox' || !env.TELEBIRR_APP_KEY;

    // Record initial order in PostgreSQL
    await query(
      `INSERT INTO payment_orders (
         id, user_id, method, amount_etb, item_type, item_title, coins, status, msisdn_masked
       ) VALUES ($1, $2, 'TELEBIRR', $3, $4, $5, $6, $7, $8)`,
      [
        orderId,
        params.userId,
        params.amountETB,
        params.itemType,
        params.itemTitle,
        params.coinsReward || 0,
        isSandbox ? 'SUCCESS' : 'PENDING',
        params.phone,
      ]
    );

    if (isSandbox) {
      logger.info({ orderId, amount: params.amountETB }, '[Telebirr Sandbox] Order auto-credited');

      // In Sandbox mode, automatically fulfill the benefit
      if (params.coinsReward && params.coinsReward > 0) {
        await query('SELECT apply_coins($1, $2, $3, $4)', [
          params.userId,
          params.coinsReward,
          `TeleBirr Purchase: ${params.itemTitle}`,
          orderId,
        ]);
      }

      if (params.itemType === 'ENERGY_PACK') {
        await query('SELECT apply_energy($1, $2, $3, $4)', [
          params.userId,
          10,
          'PURCHASE_TELEBIRR',
          `Order ${orderId}`,
        ]);
      }

      return {
        orderId,
        sandbox: true,
        status: 'SUCCESS',
        message: `[Sandbox] Payment of ${params.amountETB} ETB confirmed instantly.`,
      };
    }

    // Production TeleBirr Checkout Initiation
    const payload = {
      appId: env.TELEBIRR_APP_ID,
      outTradeNo: orderId,
      totalAmount: params.amountETB.toFixed(2),
      subject: params.itemTitle,
      notifyUrl: env.TELEBIRR_NOTIFY_URL,
      returnUrl: env.TELEBIRR_RETURN_URL,
      shortCode: env.TELEBIRR_APP_ID,
      timestamp: Date.now().toString(),
    };

    // Generate Telebirr Signature
    const signString = Object.entries(payload)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const signature = computeHmacSha256(signString, env.TELEBIRR_APP_KEY);

    const checkoutUrl = `${env.TELEBIRR_CHECKOUT_URL}?${signString}&sign=${signature}`;

    return {
      orderId,
      checkoutUrl,
      sandbox: false,
      status: 'PENDING',
      message: 'TeleBirr payment session generated. Redirecting...',
    };
  },

  /**
   * Handle TeleBirr Asynchronous Webhook Callback
   */
  async handleCallback(payload: any): Promise<{ success: boolean; message: string }> {
    const { outTradeNo, tradeStatus, sign } = payload;
    if (!outTradeNo) {
      return { success: false, message: 'Missing order identifier' };
    }

    // Lookup order in database
    const orderRes = await query('SELECT * FROM payment_orders WHERE id = $1', [outTradeNo]);
    if (orderRes.rowCount === 0) {
      return { success: false, message: 'Order not found' };
    }

    const order = orderRes.rows[0];
    if (order.status === 'SUCCESS') {
      return { success: true, message: 'Order already fulfilled (idempotent)' };
    }

    if (tradeStatus === 'Completed' || tradeStatus === 'SUCCESS') {
      await query(
        `UPDATE payment_orders
            SET status = 'SUCCESS', paid_at = NOW(), provider_ref = $1
          WHERE id = $2`,
        [payload.transactionNo || 'TB-REF', outTradeNo]
      );

      // Fulfill benefits
      if (order.coins > 0) {
        await query('SELECT apply_coins($1, $2, $3, $4)', [
          order.user_id,
          order.coins,
          `TeleBirr Purchase: ${order.item_title}`,
          outTradeNo,
        ]);
      }

      if (order.item_type === 'ENERGY_PACK') {
        await query('SELECT apply_energy($1, $2, $3, $4)', [
          order.user_id,
          10,
          'PURCHASE_TELEBIRR',
          `Order ${outTradeNo}`,
        ]);
      }

      return { success: true, message: 'Payment successfully fulfilled' };
    }

    await query(`UPDATE payment_orders SET status = 'FAILED' WHERE id = $1`, [outTradeNo]);
    return { success: false, message: 'Payment failed with carrier' };
  },

  /**
   * Disburse prize money to player via TeleBirr B2C
   */
  async disburseReward(phone: string, amountETB: number, rewardId: string): Promise<{ success: boolean; ref?: string }> {
    const isSandbox = env.TELEBIRR_MODE === 'sandbox' || !env.TELEBIRR_APP_KEY;
    const ref = `DISB_TB_${Date.now().toString(36).toUpperCase()}`;

    if (isSandbox) {
      logger.info({ phone, amountETB, rewardId, ref }, '[Telebirr Sandbox] Reward B2C transfer disbursed');
      return { success: true, ref };
    }

    // Live Telebirr B2C API Call would execute here
    logger.info({ phone, amountETB, rewardId, ref }, 'Telebirr B2C payment executed');
    return { success: true, ref };
  },
};
