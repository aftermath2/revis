import { nip19 } from 'nostr-tools';

const QUERY_TIMEOUT = 10;
const INVOICE_TIMEOUT = 600; // 10 minutes
const ITEMS_PER_LOAD = 20;
const NOSTR_CACHE_TTL = 300; // 5 minutes
const REVIS_PUBLIC_KEY = nip19.decode(import.meta.env.VITE_NOSTR_PUBLIC_KEY).data.toString();
const REVIS_LNURL_ADDRESS = import.meta.env.VITE_LNURL_ADDRESS;
const MAX_ZAP_AMOUNT = 1000000;
const MAX_COMMENT_LENGTH = 2100;

export {
    QUERY_TIMEOUT,
    INVOICE_TIMEOUT,
    ITEMS_PER_LOAD,
    NOSTR_CACHE_TTL,
    REVIS_PUBLIC_KEY,
    REVIS_LNURL_ADDRESS,
    MAX_ZAP_AMOUNT,
    MAX_COMMENT_LENGTH
};
