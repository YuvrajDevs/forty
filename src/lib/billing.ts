// Google Play subscriptions through expo-iap. The module does not exist in Expo Go or on the web,
// so everything here reports "unavailable" there and the rest of the app carries on in preview mode.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Subscription product in Play Console, with two base plans: `weekly` and `yearly`, each with a 7-day free trial offer. */
export const SUBSCRIPTION_ID = 'fortybible_premium';
export type PlanId = 'weekly' | 'yearly';

export type Offer = { plan: PlanId; token: string; price: string; trial: boolean };
export type Offers = Partial<Record<PlanId, Offer>>;
export type BuyResult = 'purchased' | 'pending' | 'cancelled' | 'error';

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
export const billingAvailable = Platform.OS === 'android' && !inExpoGo;

/** Sideloaded test builds (made with EXPO_PUBLIC_PREVIEW=1) skip the purchase so the app can be tried without Google Play. */
export const previewBuild = process.env.EXPO_PUBLIC_PREVIEW === '1';

type Iap = typeof import('expo-iap');
let iap: Iap | null = null;
let connected = false;

async function connect(): Promise<Iap | null> {
  if (!billingAvailable) return null;
  try {
    iap ??= await import('expo-iap');
    if (!connected) {
      await iap.initConnection();
      connected = true;
    }
    return iap;
  } catch {
    return null;
  }
}

/** Prices and offer tokens for each plan, preferring the offer that includes the free trial. */
export async function loadOffers(): Promise<Offers | null> {
  const m = await connect();
  if (!m) return null;
  try {
    const products = await m.fetchProducts({ skus: [SUBSCRIPTION_ID], type: 'subs' });
    const sub = products?.find((p) => p.id === SUBSCRIPTION_ID);
    const offers = (sub && 'subscriptionOffers' in sub ? sub.subscriptionOffers : null) ?? [];
    const out: Offers = {};
    for (const plan of ['weekly', 'yearly'] as PlanId[]) {
      const mine = offers.filter((o) => o.basePlanIdAndroid === plan && o.offerTokenAndroid);
      const best = mine.find((o) => o.paymentMode === 'free-trial') ?? mine[0];
      if (best) out[plan] = { plan, token: best.offerTokenAndroid!, price: priceOf(best, mine), trial: best.paymentMode === 'free-trial' };
    }
    return out;
  } catch {
    return null;
  }
}

// A trial offer's own price is "free"; the price people pay afterwards is the base plan's.
function priceOf(best: { displayPrice: string; paymentMode?: string | null }, all: { displayPrice: string; paymentMode?: string | null }[]) {
  if (best.paymentMode !== 'free-trial') return best.displayPrice;
  const paid = all.find((o) => o.paymentMode !== 'free-trial');
  return paid?.displayPrice ?? best.displayPrice;
}

/** Opens Google Play's purchase sheet. Entitlement is re-read afterwards by refreshEntitlement. */
export async function buy(offer: Offer): Promise<BuyResult> {
  const m = await connect();
  if (!m) return 'error';
  return new Promise<BuyResult>((resolve) => {
    let done = false;
    const finish = (r: BuyResult) => {
      if (done) return;
      done = true;
      okSub.remove();
      errSub.remove();
      resolve(r);
    };
    const okSub = m.purchaseUpdatedListener(async (p) => {
      if (p.productId !== SUBSCRIPTION_ID) return;
      if (p.purchaseState === 'pending') return finish('pending');
      try {
        // Subscriptions are not consumable. Not acknowledging within 3 days makes Google refund the purchase.
        await m.finishTransaction({ purchase: p, isConsumable: false });
      } catch {
        // The purchase is still valid; acknowledgement is retried on the next launch.
      }
      finish('purchased');
    });
    const errSub = m.purchaseErrorListener((e) => finish(m.isUserCancelledError(e) ? 'cancelled' : 'error'));
    m.requestPurchase({
      request: { google: { skus: [SUBSCRIPTION_ID], subscriptionOffers: [{ sku: SUBSCRIPTION_ID, offerToken: offer.token }] } },
      type: 'subs',
    }).catch(() => finish('error'));
  });
}

/**
 * Whether Google Play says the subscription is active (including the free trial).
 * Returns null when it cannot tell, such as when offline, so the caller can keep the last answer.
 */
export async function refreshEntitlement(): Promise<boolean | null> {
  const m = await connect();
  if (!m) return null;
  try {
    const purchases = await m.getAvailablePurchases();
    const mine = purchases.filter((p) => p.productId === SUBSCRIPTION_ID);
    // Make sure any purchase that was never acknowledged gets acknowledged.
    for (const p of mine) {
      if (p.purchaseState === 'purchased') m.finishTransaction({ purchase: p, isConsumable: false }).catch(() => {});
    }
    return mine.some((p) => p.purchaseState === 'purchased' && !(p as { isSuspendedAndroid?: boolean | null }).isSuspendedAndroid);
  } catch {
    return null;
  }
}

/** How long a "yes" from Play is trusted when the phone is offline. */
export const OFFLINE_GRACE_MS = 3 * 24 * 3_600_000;
