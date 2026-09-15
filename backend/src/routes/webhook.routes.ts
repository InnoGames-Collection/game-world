import { FastifyInstance } from 'fastify';
import { telebirrService } from '../services/telebirrService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { smsService } from '../services/smsService.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // TeleBirr C2B payment notification callback
  fastify.post('/telebirr/callback', async (request, reply) => {
    const payload = request.body as any;
    const result = await telebirrService.handleCallback(payload);
    return reply.send(result);
  });

  // Partner subscription notification webhook
  fastify.post('/subscription/notify', async (request, reply) => {
    const timestamp = request.headers['x-timestamp'] as string;
    const signature = request.headers['x-signature'] as string;
    const rawBody = JSON.stringify(request.body);

    // Verify HMAC signature
    if (signature && !smsService.verifyWebhookSignature(timestamp, rawBody, signature)) {
      return reply.status(401).send({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = request.body as any;
    const result = await subscriptionService.handlePartnerWebhook(payload);
    return reply.send(result);
  });

  // Partner SMS delivery status callback
  fastify.post('/sms/dlr', async (request, reply) => {
    return reply.send({ success: true, message: 'DLR acknowledged' });
  });
}
