export enum ConfigKey {
    THEME = 'theme',
    PRIVATE_KEY = 'private_key',
    SIGNER_TYPE = 'signer_type',
    WALLET_TYPE = 'wallet_type',
    NWC_URL = 'nwc_url'
}

export enum Theme {
    LIGHT = 'light',
    DARK = 'dark'
}

export enum SortOption {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    HIGHEST_RATED = 'highest_rated',
    MOST_POPULAR = 'most_popular',
    MOST_REVIEWED = 'most_reviewed',
    CONTROVERSIAL = 'controversial',
    TRENDING = 'trending',
    HOT_SCORE = 'hot_score'
}

export interface Review {
    id: string;
    author: string;
    avatar?: string;
    comment: string;
    rating: number;
    createdAt: string;
    zapAmount: number;
    zaps?: Zap[];
}

export interface Zap {
    id: string;
    eventID: string,
    username: string;
    avatar: string;
    amount: number;
    comment?: string;
    timestamp: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    path: string; // Full hierarchical path like 'bitcoin/node/client'
    level: number; // 0 for root, 1 for first level, etc.
    children?: Category[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    reviews: Review[];
    categories: string[];
}
