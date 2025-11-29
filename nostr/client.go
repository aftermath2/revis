package nostr

import (
	"context"

	"github.com/nbd-wtf/go-nostr"
	"github.com/nbd-wtf/go-nostr/nip19"
)

type Client interface {
	NewEvent(note Note) (nostr.Event, error)
	Publish(ctx context.Context, event nostr.Event) error
	Close()
}

type client struct {
	privateKey string
	publicKey  string
	pool       *nostr.SimplePool
}

func NewClient(ctx context.Context, nsec string) (Client, error) {
	_, privateKey, err := nip19.Decode(nsec)
	if err != nil {
		return nil, err
	}

	privKey := privateKey.(string)

	publicKey, err := nostr.GetPublicKey(privKey)
	if err != nil {
		return nil, err
	}

	client := &client{
		privateKey: privKey,
		publicKey:  publicKey,
		pool:       nostr.NewSimplePool(ctx),
	}

	return client, nil
}

func (c *client) NewEvent(note Note) (nostr.Event, error) {
	now := nostr.Now()
	tags := []nostr.Tag{
		{"d", note.ID},
		{"title", note.Title},
		{"image", note.ImageURL},
		{"published_at", now.Time().String()},
	}

	for _, category := range note.Tags {
		tags = append(tags, nostr.Tag{"t", category})
	}

	event := nostr.Event{
		PubKey:    c.publicKey,
		CreatedAt: now,
		Kind:      nostr.KindArticle,
		Tags:      tags,
		Content:   note.Content,
	}

	if err := event.Sign(c.privateKey); err != nil {
		return nostr.Event{}, err
	}

	return event, nil
}

// Publish event on many relays.
func (c *client) Publish(ctx context.Context, event nostr.Event) error {
	resultCh := c.pool.PublishMany(ctx, urls, event)
	result := <-resultCh
	return result.Error
}

// Close pooled connections.
func (c *client) Close() {
	c.pool.Close("")
}

func (c *client) ListZaps(ctx context.Context, eventID string) []nostr.Event {
	events := c.pool.FetchMany(ctx, urls, nostr.Filter{Kinds: []int{9735}, Tags: nostr.TagMap{"e": []string{eventID}}})

	zaps := make([]nostr.Event, 0, len(events))
	for event := range events {
		zaps = append(zaps, *event.Event)
	}

	return zaps
}

// ValidateZap event on many relays.
func (c *client) ValidateZap(ctx context.Context, event nostr.Event) error {
	/*
		1. The zap receipt event's pubkey MUST be the same as the recipient's lnurl provider's nostrPubkey
		2. The invoiceAmount contained in the bolt11 tag of the zap receipt MUST equal the amount tag of the zap request
		3. The lnurl tag of the zap request (if present) SHOULD equal the recipient's lnurl
	*/
	return nil
}
