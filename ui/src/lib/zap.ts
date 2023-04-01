import { type NostrEvent } from 'nostr-tools';

import type NostrClient from './nostr/client';
import { type Review, WalletType, type Zap } from './types';
import type Wallet from './wallet/wallet';

export interface ZapResponse {
    preimage?: string;
    invoice?: string;
}

export const zap = async (
    nostrClient: NostrClient,
    wallet?: Wallet,
    event?: NostrEvent,
    zapAmount?: number,
    comment?: string,
    rating?: number,
    lud16?: string,
): Promise<ZapResponse> => {
    if (!wallet) throw new Error('No wallet available');
    if (!event) throw new Error('Nostr event not found');
    if (!zapAmount) throw new Error('No zap amount specified');

    const zapRequest = await nostrClient.createZapRequest(event, zapAmount, comment, rating);
    const invoice = await wallet.getInvoice(zapRequest, zapAmount, lud16);

    if (wallet?.getWalletType() !== WalletType.LIGHTNING) {
        const preimage = await wallet.payInvoice(invoice);
        return {preimage: preimage};
    } 
    
    return {invoice: invoice};
}

/**
 * Formats numbers with comma separators for better readability.
 * 
 * @param num - The number to format
 * @returns Formatted string with comma separators
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

/**
 * Calculates a weighted average rating for a note based on review ratings and their zaps.
 * 
 * Reviews with more sats have more influence on the final rating.
 * Similar to how S&P 500 companies are weighted by market capitalization.
 *
 * @param reviews - The reviews to calculate the weighted rating for
 * @returns Weighted average rating and total number of zaps.
 */
export const calculateRating = (reviewsMap: Map<Review, Zap[]>): [number, number] => {
    if (reviewsMap.size === 0) {
        return [0, 0];
    }

    let weightedRating = 0;
    let totalAmount = 0;
    
    for (const [review, zaps] of reviewsMap.entries()) {
        let zapsAmount = review.zapAmount;

        if (zaps.length > 0) {
            zaps.forEach((zap) => {
                zapsAmount += zap.amount;
            });
        }
    
        weightedRating += review.rating * zapsAmount;
        totalAmount += zapsAmount;
    }

    return [weightedRating / totalAmount, totalAmount];
};
