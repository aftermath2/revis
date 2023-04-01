package nostr

var urls = []string{
	"wss://relay.damus.io",
	"wss://nos.lol",
	"wss://nostr.bitcoiner.social",
	"wss://nostr.vulpem.com",
	"wss://relay.nostr.band",
	"wss://cyberspace.nostr1.com",
	"wss://relay.bitcoinpark.com",
	"wss://relay.satlantis.io",
	"wss://relay.azzamo.net",
}

/*
Item: Kind 30023 event
Item upvote: 9734 event with an `e` tag pointing to the 30023 event and with the tag "up": "1", `content` contains the review comment
Item downvote: 9734 event with the tag "up": "0", `content` contains the review comment
Review votes: 9734 event with an `e` tag pointing to the upvote/downvote zap (9735 event)

	Zap request tags:
		- relays: list of relays where the receipt should be published to
		- amount: amount in millisats the sender intends to pay
		- lnurl: lnurl pay url of the recipient
		- p: hex-encoded pubkey of the recipient
		- *e: hex-encoded event id
		- *a: event coordinate
		- *k: stringified kind of the target event

	Zap receipt tags:
		- p: zap recipient public key
		- bolt11: bolt11 invoice
		- description: JSON-encoded zap request. SHA256(description) should match the description hash in the bolt11 invoice
		- *preimage: secret to match against the payment hash of the bolt11 invoice
		- *e: tag from the zap request
		- *a: tag from the zap request
		- *P: pubkey of the zap request
*/

// Note represents an article that will be published to various relays.
type Note struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	ImageURL   string   `json:"image_url"`
	Categories []string `json:"categories"`
}
