package nostr

var urls = []string{
	"wss://relay.damus.io",
	"wss://relay.primal.net",
	"wss://nos.lol",
	"wss://nostr.vulpem.com",
	"wss://cyberspace.nostr1.com",
	"wss://relay.bitcoinpark.com",
	"wss://relay.satlantis.io",
	"wss://wot.nostr.party",
}

// Note represents an article that will be published to various relays.
type Note struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	ImageURL   string   `json:"image_url"`
	Categories []string `json:"categories"`
}
