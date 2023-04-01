package nostr

import (
	"context"
	"encoding/json"

	"fiatjaf.com/nostr"
	"fiatjaf.com/nostr/nip19"
)

type ProfileMetadata struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	About       string `json:"about"`
	Picture     string `json:"picture"`
	NIP05       string `json:"nip05"`
	LUD16       string `json:"lud16"`
}

type Client interface {
	Close()
	NewEvent(note Note) (nostr.Event, error)
	Publish(ctx context.Context, event nostr.Event) error
	SetProfileMetadata(ctx context.Context, lnurlAddress string) error
}

type client struct {
	privateKey [32]byte
	publicKey  [32]byte
	pool       *nostr.Pool
}

func NewClient(ctx context.Context, nsec string) (Client, error) {
	_, privateKey, err := nip19.Decode(nsec)
	if err != nil {
		return nil, err
	}

	privKey := privateKey.(nostr.SecretKey)
	publicKey := nostr.GetPublicKey(privKey)

	client := &client{
		privateKey: privKey,
		publicKey:  publicKey,
		pool:       nostr.NewPool(nostr.PoolOptions{PenaltyBox: true}),
	}

	return client, nil
}

// Close pooled connections.
func (c *client) Close() {
	c.pool.Close("")
}

func (c *client) NewEvent(note Note) (nostr.Event, error) {
	now := nostr.Now()
	tags := []nostr.Tag{
		{"d", note.ID},
		{"title", note.Title},
		{"image", note.ImageURL},
		{"published_at", now.Time().String()},
	}

	for _, category := range note.Categories {
		tags = append(tags, nostr.Tag{"t", category})
	}

	event := nostr.Event{
		Kind:      nostr.KindArticle,
		PubKey:    c.publicKey,
		Content:   note.Content,
		CreatedAt: now,
		Tags:      tags,
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

func (c *client) SetProfileMetadata(ctx context.Context, lnurlAddress string) error {
	metadata := ProfileMetadata{
		Name:        "Revis testnet",
		DisplayName: "Revis testnet",
		About:       "",
		Picture:     "",
		NIP05:       lnurlAddress,
		LUD16:       lnurlAddress,
	}

	content, err := json.Marshal(metadata)
	if err != nil {
		return err
	}

	event := nostr.Event{
		Kind:      nostr.KindProfileMetadata,
		PubKey:    c.publicKey,
		Content:   string(content),
		CreatedAt: nostr.Now(),
		Tags:      []nostr.Tag{},
	}

	if err := event.Sign(c.privateKey); err != nil {
		return err
	}

	resultCh := c.pool.PublishMany(ctx, urls, event)
	result := <-resultCh
	return result.Error
}

func (c *client) ListZaps(ctx context.Context, eventID string) []nostr.Event {
	events := c.pool.FetchMany(
		ctx,
		urls,
		nostr.Filter{
			Kinds: []nostr.Kind{9735},
			Tags: nostr.TagMap{
				"e": []string{eventID},
			},
		},
		nostr.SubscriptionOptions{},
	)

	zaps := make([]nostr.Event, 0, len(events))
	for event := range events {
		zaps = append(zaps, event.Event)
	}

	return zaps
}
