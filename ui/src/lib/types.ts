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

enum SignerType {
    EXTENSION = 'extension',
    KEY = 'key'
}

enum WalletType {
    LIGHTNING = 'lightning',
    NWC = 'nwc', 
    WEBLN = 'webln'
}

type UserMetadata = {
    name: string
    about?: string
    picture?: string
    lud16?: string
}

type User = {
    publicKey?: string
    privateKey?: string
    metadata?: UserMetadata
}

/*
{
    "id": <id>,
    "kind": 30023,
    "pubkey": <revisPublicKey>,
    "created_at": <createdAt>,
    "content": <content>,
    "tags": [
        ["d", <d>], // Used just to remove duplicates
        ["title", <title>],
        ["image", <image>],
        ["t", <category_1>],
        ["t", <category_2>],
        ["t", <category_n>],
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

// Same as Note, but with a map of its reviews<->zaps.
interface AnnotatedNote extends Note {
    reviewsMap: Map<Review, Zap[]>;
}

/*
Amount is obtained from the zap request (9734)
{
    "kind": 9735,
    "id": <id>,
    "content": <comment>,
    "pubkey": <recipientPublicKey>,
    "created_at": <createdAt>,
    "tags": [
        ["e", <noteID>],
        ["p", <recipient>],
        ["rating", <rating>],
        ["P", <authorPublicKey>]
    ]
}
*/
interface Review {
    id: string;
    noteID: string,
    authorPublicKey: string;
    recipient: string;
    comment: string;
    rating: number;
    zapAmount: number;
    createdAt: number;
}

/*
Amount is obtained from the zap request (9734)
{
    "kind": 9735,
    "id": <id>,
    "content": <comment>,
    "pubkey": <authorPublicKey>,
    "created_at": <createdAt>,
    "tags": [
        ["e", <eventID>],
        ["p", <recipient>]
    ]
}
*/
interface Zap {
    id: string;
    eventID: string,
    authorPublicKey: string;
    recipient: string;
    amount: number;
    comment?: string;
    createdAt: number;
    rating?: number,
}

/*
{
    "kind": 9734,
    "id": <id>,
    "content": <comment>,
    "pubkey": <authorPublicKey>,
    "created_at": <createdAt>,
    "tags": [
        ["e", <eventID>],
        ["lnurl", <lnurl>],
        ["amount"; <amountMsat>],
        ["rating", <rating>]
    ]
}
*/
interface ZapRequest {
    eventID: string,
    author: string;
    amountMsat: number;
    lnurl?: string;
    comment?: string;
    rating?: number;
}

interface LNURLServerResponse {
    allowsNostr: boolean;
    nostrPubkey: string;
}

type NostrRelay = { read: boolean, write: boolean };

type NostrRelays = Record<string, NostrRelay>;

export {
    ConfigKey,
    Theme,
    SortOption,
    SignerType,
    WalletType,
    type UserMetadata,
    type User,
    type Note,
    type AnnotatedNote,
    type Review,
    type Zap,
    type ZapRequest,
    type LNURLServerResponse,
    type NostrRelays
}