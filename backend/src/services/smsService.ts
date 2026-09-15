import { env } from '../config/env.js';
import { computeHmacSha256, timingSafeEqual } from '../utils/crypto.js';
import pino from 'pino';

const logger = pino({ name: 'SmsService' });

export interface SendMtParams {
  msisdn: string;       // 251911000000
  type: 'otp' | 'optin' | 'optout' | 'business';
  message: string;
  extTransactionId?: string;
  callbackUrl?: string;
  serviceId?: number;
}

export interface SendMtResult {
  success: boolean;
  message: string;
  transactionId?: string;
  errorCode?: string;
}

export const smsService = {
  /**
   * Send an MT SMS message via Partner MT API or simulated Mock Gateway
   */
  async sendMt(params: SendMtParams): Promise<SendMtResult> {
    const serviceId = params.serviceId || env.SMSC_SERVICE_ID;

    if (env.SMS_MODE === 'mock') {
      const mockTxId = `mock-mt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      logger.info(
        {
          msisdn: params.msisdn,
          type: params.type,
          message: params.message,
          mockTxId,
        },
        '[SMSC Mock] Simulated Outbound MT Delivered'
      );
      return {
        success: true,
        message: 'Mock MT delivered successfully',
        transactionId: mockTxId,
      };
    }

    // Live Partner MT Gateway Integration
    try {
      const endpoint = `${env.SMSC_BASE_URL}/api/v1/mt/send`;
      const body = {
        serviceId,
        msisdn: params.msisdn,
        type: params.type,
        message: params.message,
        extTransactionId: params.extTransactionId,
        callbackUrl: params.callbackUrl,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': env.SMSC_API_KEY,
        },
        body: JSON.stringify(body),
      });

      const data: any = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        logger.info(
          { msisdn: params.msisdn, txId: data.data?.transactionId },
          'Live MT dispatched to telecom gateway'
        );
        return {
          success: true,
          message: data.message || 'MT published',
          transactionId: data.data?.transactionId,
        };
      }

      logger.warn(
        { status: response.status, data, msisdn: params.msisdn },
        'Telecom gateway rejected MT message'
      );
      return {
        success: false,
        message: data?.message || 'Gateway rejected SMS',
        errorCode: data?.errorCode || 'GW_ERROR',
      };
    } catch (err: any) {
      logger.error({ err: err.message, msisdn: params.msisdn }, 'Error dispatching SMS to gateway');
      return {
        success: false,
        message: 'Telecom SMS gateway unreachable',
        errorCode: 'NETWORK_ERROR',
      };
    }
  },

  /**
   * Verify authenticity of Partner Subscription Notification Webhook
   * HMAC-SHA256 of "{timestamp}.{rawBody}" with shared secret
   */
  verifyWebhookSignature(timestamp: string, rawBody: string, signatureHeader: string): boolean {
    if (!timestamp || !signatureHeader) return false;

    // Check clock skew (maximum 300 seconds)
    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(timestamp, 10);
    if (isNaN(tsSec) || Math.abs(nowSec - tsSec) > 300) {
      logger.warn({ nowSec, tsSec }, 'Webhook rejected: Timestamp clock skew exceeded 300s');
      return false;
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSig = computeHmacSha256(payload, env.SMSC_WEBHOOK_SECRET);
    const receivedSig = signatureHeader.replace(/^sha256=/, '');

    return timingSafeEqual(expectedSig, receivedSig);
  },
};
