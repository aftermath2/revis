import { type NostrEvent } from 'nostr-tools'
import { getSatoshisAmountFromBolt11, validateZapRequest } from 'nostr-tools/nip57'
import { utf8Decoder } from 'nostr-tools/utils'
import { bech32 } from '@scure/base'

import { type LNURLServerResponse, type Note, type Review, type Zap, type ZapRequest, type NostrRelays } from '../types'
import { REVIS_LNURL_ADDRESS } from '../configuration'


const MAX_CACHE_SIZE = 1_000;

class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private maxSize: number;

    constructor(maxSize: number = MAX_CACHE_SIZE) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value) {
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
}

const zapCache = new LRUCache<string, Zap>();


const parseTag = (event: NostrEvent, name: string, required?: boolean): string => {
    for (const tag of event.tags) {
        if (tag[0] === name) {
            return tag[1];
        }
    }

    // Workaround to avoid checking on a tag basis
    if (required) {
        throw new Error(`The ${name} tag is required and was not found`);
    }

    return '';
}

const parseTags = (event: NostrEvent, name: string): string[] => {
    const values: string[] = [];
    for (const tag of event.tags) {
        if (tag[0] === name) {
            values.push(tag[1])
        }
    }

    return values;
}

const decodeLNURL = (lnurl: string): string => {
    const { words } = bech32.decode(lnurl as `${string}1${string}`, 1000);
    const data = bech32.fromWords(words);
    return utf8Decoder.decode(data);
}

const parseZapRequest = (zapReceipt: NostrEvent): ZapRequest => {
    const zapRequestString = parseTag(zapReceipt, 'description', true);

    const err = validateZapRequest(zapRequestString);
    if (err) {
        throw new Error(`Invalid zap request: ${err}`);
    }

    const zapRequest: NostrEvent = JSON.parse(zapRequestString) as NostrEvent
    const amount = parseTag(zapRequest, 'amount', true);
    const eventID = parseTag(zapRequest, 'e', true);
    const lnurl = parseTag(zapRequest, 'lnurl');
    const rating = parseTag(zapRequest, 'rating');

    return {
        amountMsat: parseInt(amount),
        author: zapRequest.pubkey,
        eventID: eventID,
        lnurl: lnurl !== '' ? lnurl : undefined,
        comment: zapRequest.content,
        rating: parseInt(rating),
    }
}

const parseZap = async (zapReceipt: NostrEvent, recipientLud16?: string): Promise<Zap> => {
    const cached = zapCache.get(zapReceipt.id);
    if (cached) {
        return cached;
    }

    if (!recipientLud16) {
        throw new Error('Invalid zap');
    }

    const zapRequest: ZapRequest = parseZapRequest(zapReceipt);
    const bolt11 = parseTag(zapReceipt, 'bolt11', true);

    const receiptAmount = getSatoshisAmountFromBolt11(bolt11);
    if (receiptAmount * 1000 != zapRequest.amountMsat) {
        throw new Error(`Invalid zap amount`);
    }

    const [name, domain] = recipientLud16.split('@');
    const lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString();

    if (zapRequest.lnurl && decodeLNURL(zapRequest.lnurl) !== lnurl) {
        throw new Error('Zap request and recipient LNURLs do not match');
    }
    
    const res = await fetch(lnurl);
    const resp = await res.json() as LNURLServerResponse;
    if (!resp) {
        throw new Error('Failed to fetch LNURL server response');
    }

    if (!resp?.allowsNostr) {
        throw new Error('LNURL server does not support `allowsNostr`');
    }

    if (resp?.nostrPubkey !== zapReceipt.pubkey) {
        throw new Error('Zap receipt\'s pubkey does not match LNURL provider\'s nostrPubkey');
    }

    const zap: Zap = {
        // Convert to satoshis
        amount: zapRequest.amountMsat / 1000,
        authorPublicKey: zapRequest.author,
        recipient: parseTag(zapReceipt, 'p', true),
        eventID: zapRequest.eventID,
        id: zapReceipt.id,
        createdAt: zapReceipt.created_at,
        comment: zapRequest.comment,
        rating: zapRequest.rating,
    }

    zapCache.set(zapReceipt.id, zap);
    return zap;
}

const parseReview = async (event: NostrEvent): Promise<Review | undefined> => {
    try {
        const zap = await parseZap(event, REVIS_LNURL_ADDRESS);
        if (!zap.rating) {
            throw new Error('Review has no rating');
        }

        return {
            id: event.id,
            noteID: parseTag(event, 'e', true),
            authorPublicKey: zap.authorPublicKey,
            recipient: zap.recipient,
            comment: event.content,
            rating: zap.rating,
            zapAmount: zap.amount,
            createdAt: event.created_at,
        }
    } catch (e) {
        console.error(e);
    }

    return;
}

const parseNote = (event: NostrEvent): Note => {
    const image = parseTag(event, 'image');

    return {
        categories: parseTags(event, 't'),
        content: event.content,
        createdAt: event.created_at,
        id: event.id,
        title: parseTag(event, 'title', true),
        image: image !== '' ? image : undefined,
    }
}

const nostrRelaysToList = (relays?: NostrRelays): string[] => {
    if (!relays) {
        return [];
    }

    return Object.entries(relays)
        .filter(([, relay]) => relay.read && relay.write)
        .map(([url]) => url);
}

const eventIDKeySelector = (event: NostrEvent): string => {
    return event.id;
}

const zapRecipientKeySelector = (event: NostrEvent): string => {
    return parseTag(event, 'p', true);
}

export {
    parseZapRequest,
    parseZap,
    parseTag,
    parseTags,
    parseReview,
    parseNote,
    nostrRelaysToList,
    eventIDKeySelector,
    zapRecipientKeySelector,
}