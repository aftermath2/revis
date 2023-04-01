## Revis

Revis is a platform based on nostr where users can review anything and commit to their opinions by putting their money in the pot.

Reviews are backed by energy and proof of work. This is done using the Lightning Network and nostr zaps.

Ratings are weighted based on the zaps the each review gets, effectively prioritizing those who have more energy channeled to them.

### Features

- Notes are posted using the same public/key pair (owned by the service).
- Review items and get zapped for it!
- Only reviews that have proof of work in them are displayed (zaps to it or pow nonce).
- Rating system based on user reviews weighted by their zaps (reviews with few sats have less relevance than those with higher sats)

### Server

- Create new items
- Index notes and zaps as a backup mechanism in case relays stop relaying notes or some other kind of issues. The frontend could use the API as a fallback

### Name alternatives

- Revzap
- Revsat
- Zapr
- Reviewr
- OpenZap
- Blaze
- Pulse
- Revis

### Ideas

- Custom comparisons created by the users (pick N items and write a post comparing them). Could be comparing the performance of Core lightning vs LND
- People/companies claiming a note and using their public key to verify users' reviews which contain a signature of a purchase.
- Revis could be integrated by apps such as a decentralized google maps where the reviews on the map are based on it. Furthermore, online services or companies could show the success of their products by embedding the reviews in their sites.
- Leaderboards

### Domains

revis.social
revis.pw
revis.pub
revis.sh
revis.cat
revis.run
revis.ws
revis.wtf
revis.tech
