import { type UserMetadata } from "./nostr/nostr";

enum ConfigKey {
    THEME = 'theme',
    PRIVATE_KEY = 'private_key',
    SIGNER_TYPE = 'signer_type',
    WALLET_TYPE = 'wallet_type',
    NWC_URL = 'nwc_url'
}

enum Theme {
    LIGHT = 'light',
    DARK = 'dark'
}

enum SortOption {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    HIGHEST_RATED = 'highest_rated',
    MOST_POPULAR = 'most_popular',
    MOST_REVIEWED = 'most_reviewed',
    CONTROVERSIAL = 'controversial',
    TRENDING = 'trending',
    HOT_SCORE = 'hot_score'
}

type User = {
    publicKey?: string
    privateKey?: string
    metadata?: UserMetadata
}

/*
{
    "kind": 30023,
    "pubkey": <author>,
    "created_at": <createdAt>,
    "content": <content>,
    "tags": [
        ["d", <id>],
        ["title", <title>],
        ["image", <image>],
        ["category", <category_1>],
        ["category", <category_2>],
        ["category", <category_n>],
    ]
}
*/
interface Note {
    id: string;
    title: string;
    content: string;
    image?: string;
    createdAt: number;
    categories: string[];
}

/*
Amount is obtained from the zap request (9734)
{
    "kind": 9735
    "id": <id>,
    "content": <comment>,
    "pubkey": <author>,
    "created_at": <createdAt>
    "tags": [
        ["rating", <rating>],
    ]
}
*/
interface Review {
    id: string;
    noteID: string,
    authorPublicKey: string;
    comment: string;
    rating: number;
    createdAt: number;
    zapAmount: number;
}

interface Zap {
    id: string;
    eventID: string,
    authorPublicKey: string;
    recipient: string;
    amount: number;
    comment?: string;
    createdAt: number;
}

interface ZapRequest {
    eventID: string,
    author: string;
    amount: number;
    lnurl?: string;
    comment?: string;
}

interface Category {
    id: string;
    // Full hierarchical path like 'programming/languages/javascript' - also serves as the name
    path: string;
    description?: string;
}

interface LNURLServerResponse {
    allowsNostr: boolean;
    nostrPubkey: string;
}

export {
    ConfigKey,
    Theme,
    SortOption,
    type User,
    type Review,
    type Zap,
    type ZapRequest,
    type Category,
    type Note,
    type LNURLServerResponse,
}