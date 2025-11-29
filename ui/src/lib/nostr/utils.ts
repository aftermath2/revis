import { type NostrEvent } from "nostr-tools"
import { getSatoshisAmountFromBolt11, validateZapRequest } from "nostr-tools/nip57"
import { utf8Decoder } from "nostr-tools/utils"
import { bech32 } from "@scure/base"

import { type LNURLServerResponse, type Note, type Review, type Zap, type ZapRequest } from "../types"


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

    return "";
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
    const { words } = bech32.decode(lnurl, 1000)
    const data = bech32.fromWords(words)
    return utf8Decoder.decode(data)
}

const parseZapRequest = (zapReceipt: NostrEvent): ZapRequest => {
    const zapRequestString = parseTag(zapReceipt, "description", true);

    if (!validateZapRequest(zapRequestString)) {
        throw new Error("Invalid zap receipt");
    }

    const zapRequest: NostrEvent = JSON.parse(zapRequestString) as NostrEvent
    const amount = parseTag(zapRequest, "amount", true);
    const eventID = parseTag(zapRequest, "e", true);
    const lnurl = parseTag(zapRequest, "lnurl");

    return {
        amount: parseInt(amount),
        author: zapRequest.pubkey,
        eventID: eventID,
        lnurl: lnurl !== "" ? lnurl : undefined,
        comment: zapRequest.content
    }
}

const parseZap = async (zapReceipt: NostrEvent, recipientLud16?: string): Promise<Zap> => {
    if (!recipientLud16) {
        throw new Error("Invalid zap");
    }

    const zapRequest: ZapRequest = parseZapRequest(zapReceipt);
    const bolt11 = parseTag(zapReceipt, "bolt11", true);
    
    const receiptAmount = getSatoshisAmountFromBolt11(bolt11);
    if (receiptAmount != zapRequest.amount) {
        throw new Error("Invalid zap receipt");
    }

    const [name, domain] = recipientLud16.split('@')
    const lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString()

    if (zapRequest.lnurl && decodeLNURL(zapRequest.lnurl) !== lnurl) {
        throw new Error("Zap request and recipient LNURLs do not match");
    }
    
    const res = await fetch(lnurl);
    const resp = await res.json() as LNURLServerResponse;

    if (!resp?.allowsNostr) {
        throw new Error("LNURL server does not support `allowsNostr`");
    }

    if (resp?.nostrPubkey !== zapReceipt.pubkey) {
        throw new Error("Zap receipt's pubkey does not match LNURL provider's nostrPubkey");
    }

    return {
        amount: zapRequest.amount,
        authorPublicKey: zapRequest.author,
        recipient: parseTag(zapReceipt, "p", true),
        eventID: zapRequest.eventID,
        id: zapReceipt.id,
        createdAt: zapReceipt.created_at,
        comment: zapRequest.comment
    }
}

const parseReview = async (event: NostrEvent, authorLud16?: string): Promise<Review> => {
    const zap = await parseZap(event, authorLud16);
    const rating = parseTag(event, "rating", true);

    return {
        id: event.id,
        noteID: parseTag(event, "e", true),
        authorPublicKey: event.pubkey,
        comment: event.content,
        rating: parseInt(rating),
        zapAmount: zap.amount,
        createdAt: event.created_at,
    }
}

const parseNote = (event: NostrEvent): Note => {
    const image = parseTag(event, "image");

    return {
        categories: parseTags(event, "t"),
        content: event.content,
        createdAt: event.created_at,
        id: parseTag(event, "d", true),
        title: parseTag(event, "title", true),
        image: image !== "" ? image : undefined,
    }
}

export {
    parseZapRequest,
    parseZap,
    parseTag,
    parseTags,
    parseReview,
    parseNote
}