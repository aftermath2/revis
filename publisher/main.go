package main

import (
	"context"
	"encoding/json"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	nostrLib "fiatjaf.com/nostr"
	"github.com/aftermath2/revis/publisher/nostr"

	"github.com/joho/godotenv"
	"github.com/pkg/errors"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Could not load .env file: %v", err)
	}

	nostrPrivateKey := os.Getenv("NOSTR_PRIVATE_KEY")
	if nostrPrivateKey == "" {
		log.Fatal("NOSTR_PRIVATE_KEY environment variable is required")
	}

	lnurlAddress := os.Getenv("LNURL_ADDRESS")
	if lnurlAddress == "" {
		log.Fatal("LNURL_ADDRESS environment variable is required")
	}

	ctx := context.Background()

	client, err := nostr.NewClient(ctx, nostrPrivateKey)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	if err := client.SetProfileMetadata(ctx, lnurlAddress); err != nil {
		log.Fatalf("Setting profile metadata: %v", err)
	}

	err = filepath.WalkDir("./notes", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return errors.Wrap(err, "walking file")
		}

		if filepath.Ext(path) != ".json" {
			return nil
		}

		f, err := os.Open(path)
		if err != nil {
			return errors.Wrap(err, "opening file")
		}
		defer f.Close()

		var note nostr.Note
		if err := json.NewDecoder(f).Decode(&note); err != nil {
			return errors.Wrap(err, "decoding file")
		}

		event, err := client.NewEvent(note)
		if err != nil {
			return errors.Wrap(err, "creating event")
		}

		if err := publishWithRetry(ctx, client, event); err != nil {
			log.Print(err)
			return nil
		}

		time.Sleep(500 * time.Millisecond)

		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
}

func publishWithRetry(ctx context.Context, client nostr.Client, event nostrLib.Event) error {
	maxRetries := 5
	baseDelay := 2 * time.Second

	for i := 0; i < maxRetries; i++ {
		err := client.Publish(ctx, event)
		if err == nil {
			return nil
		}

		if !strings.Contains(err.Error(), "rate-limited") {
			return err
		}

		delay := baseDelay * time.Duration(1<<i)
		log.Printf("Rate limited, retrying in %v... (attempt %d/%d)", delay, i+1, maxRetries)
		time.Sleep(delay)
	}

	return errors.New("max retries exceeded for rate-limited request")
}
