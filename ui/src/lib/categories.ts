const CATEGORIES = {
    "bitcoin": {
        "bip": {
            "covenant": {},
            "segwit": {},
            "taproot": {}
        },
        "soft_fork": {},
        "book": {},
        "coinjoin": {},
        "company": {
            "treasury": {
            }
        },
        "conference": {},
        "content_creator": {},
        "documentary": {},
        "exchange": {
            "centralized": {},
            "decentralized": {
                "robosats": {
                    "coordinator": {}
                }
            }
        },
        "lightning": {
            "implementation": {
                "lnd": {
                    "tool": {}
                }
            },
            "node": {},
            "wallet": {
                "custodial": {},
                "non_custodial": {},
                "mobile": {},
                "web": {}
            },
        },
        "mining": {
            "hardware": {
                "bitaxe": {}
            },
            "pool": {}
        },
        "node": {
            "client": {},
            "software": {}
        },
        "podcast": {},
        "wallet": {
            "hardware": {
                "bitbox": {},
                "blockstream": {},
                "coinkite": {},
                "ledger": {},
                "passport": {},
                "seedsigner": {},
                "trezor": {},
            },
            "software": {},
        },
    },
    "ecash": {
        "cashu": {
            "mint": {}
        },
        "fedimint": {}
    },
    "nostr": {
        "client": {
            "android": {},
            "desktop": {},
            "web": {}
        },
        "relay": {}
    }
}

export const getCategoryName = (path: string): string => {
    const segments = path.split('/');
    const categoryName = segments[segments.length - 1] || path;
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
};