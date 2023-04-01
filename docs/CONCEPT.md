## Concept

### Items

Users post items to be reviewed. The item contains the following fields:

- Title
- Description
- Image URL (optional)
- Coordinates (optional)
- Content URL (optional)

Each item costs 100 sats to pay for the servers and LLMs enriching the content and validating it.

The user pays a HOLD invoice that only gets accepted if the item is finally published, otherwise it is cancelled.

Content and images should be validated to prevent users from posting illegal stuff.

### Votes

Users may then upvote/downvote items to represent how much they like it.

For this, two notes are created for the same item. Only the one is displayed in the UI. 

> May be worth exploring whether zaps could signal their direction

### Reviews

Users may upload reviews using their npub, reviews will display how much the user zapped the item to prove their commitment.

> Reviews could also be posted using proof of work to show commitment.

### Users

Users can log in using:

- Nostr connect: https://github.com/nostr-connect/connect
- NIP-07: browser extension
- NIP-46: remote signer
- Nsec: private key

https://github.com/nbd-wtf/nostr-tools
https://github.com/shopstr-eng/shopstr/tree/main/utils/nostr/signers