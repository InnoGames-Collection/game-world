/**
 * telebirr Direct Checkout Payment Service
 * 
 * Strictly handles telebirr integration for:
 * 1. GoPlay Coin Pack Purchases (10 coins for 10 ETB)
 * 2. VIP Subscription Passes (Daily 10 ETB, Weekly 25 ETB, Monthly 50 ETB)
 */

import { 
  PaymentStatus, 
  PaymentTransaction, 
  UserProfile 
} from '../types';
import { maskPhoneNumber } from '../utils/formatters';
import { StorageService } from './storageService';
import { apiService } from './apiService';

export interface PaymentRequest {
  method: 'TELEBIRR';
  amountETB: number;
  itemType: 'COIN_PACK' | 'VIP_SUBSCRIPTION';
  itemTitle: string;
  coinsReward?: number;
  packageId?: 'COIN_PACK_10' | 'COIN_PACK_30' | 'COIN_PACK_50';
  plan?: 'daily' | 'weekly' | 'monthly';
}

export interface PaymentResult {
  status: PaymentStatus;
  transaction: PaymentTransaction;
  message: string;
  checkoutUrl?: string;
}

export const PaymentService = {
  /**
   * Process a payment via telebirr C2B checkout
   */
  async processPayment(
    profile: UserProfile,
    request: PaymentRequest,
    onStatusChange?: (status: PaymentStatus, stepMessage?: string) => void
  ): Promise<PaymentResult> {
    const txId = 'TX_TB_' + Date.now().toString(36).toUpperCase() + '_' + Math.floor(1000 + Math.random() * 9000);
    const maskedPhone = maskPhoneNumber(profile.phoneNumber || '+251 91 000 0000');

    const tx: PaymentTransaction = {
      transactionId: txId,
      method: 'TELEBIRR',
      amountETB: request.amountETB,
      itemType: request.itemType === 'COIN_PACK' ? 'COIN_PACK' : 'VIP_SUBSCRIPTION',
      itemTitle: request.itemTitle,
      timestamp: new Date().toISOString(),
      status: 'PROCESSING',
      msisdnMasked: maskedPhone,
    };

    onStatusChange?.('PROCESSING', 'Connecting to telebirr payment gateway...');

    try {
      let res: { success: boolean; checkoutUrl?: string; message?: string };

      if (request.itemType === 'COIN_PACK') {
        const pkg = request.packageId || (request.amountETB === 50 ? 'COIN_PACK_50' : request.amountETB === 30 ? 'COIN_PACK_30' : 'COIN_PACK_10');
        res = await apiService.buyCoins(pkg);
      } else {
        res = await apiService.activateSubscription(request.plan || 'weekly');
      }

      if (res.success) {
        tx.status = 'SUCCESS';
        tx.referenceCode = 'REF_TB_' + Math.random().toString(36).substring(2, 9).toUpperCase();
        
        // If coins purchased, credit to profile immediately
        if (request.itemType === 'COIN_PACK') {
          const updatedProfile: UserProfile = {
            ...profile,
            coins: (profile.coins || 0) + 10,
          };
          StorageService.saveProfile(updatedProfile);
        }

        StorageService.recordPaymentTransaction(tx);
        onStatusChange?.('SUCCESS', `Payment of ${request.amountETB} ETB confirmed!`);

        return {
          status: 'SUCCESS',
          transaction: tx,
          checkoutUrl: res.checkoutUrl,
          message: res.message || `Payment of ${request.amountETB} ETB confirmed via telebirr.`,
        };
      } else {
        tx.status = 'FAILED';
        tx.errorMessage = res.message || 'Payment initiation failed with telebirr.';
        StorageService.recordPaymentTransaction(tx);
        onStatusChange?.('FAILED', tx.errorMessage);
        return {
          status: 'FAILED',
          transaction: tx,
          message: tx.errorMessage,
        };
      }
    } catch (err: any) {
      tx.status = 'FAILED';
      tx.errorMessage = err.message || 'Payment gateway connection error.';
      StorageService.recordPaymentTransaction(tx);
      onStatusChange?.('FAILED', tx.errorMessage);
      return {
        status: 'FAILED',
        transaction: tx,
        message: tx.errorMessage,
      };
    }
  },

  /**
   * Cancel an ongoing transaction
   */
  cancelPayment(transactionId: string): PaymentTransaction {
    const tx: PaymentTransaction = {
      transactionId,
      method: 'TELEBIRR',
      amountETB: 0,
      itemType: 'COIN_PACK',
      itemTitle: 'Cancelled Order',
      timestamp: new Date().toISOString(),
      status: 'CANCELLED',
      msisdnMasked: '+251 91 **** 000',
      errorMessage: 'User aborted payment authorization.',
    };

    StorageService.recordPaymentTransaction(tx);
    return tx;
  },

  /**
   * Get historical payment records
   */
  getPaymentHistory(): PaymentTransaction[] {
    return StorageService.getPaymentTransactions();
  },
};
