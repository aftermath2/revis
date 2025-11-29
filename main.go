package main

import (
	"context"
	"log"
	"os"

	"github.com/aftermath2/revis/nostr"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Warning: Could not load .env file: %v", err)
	}

	nostrPrivateKey := os.Getenv("NOSTR_PRIVATE_KEY")
	if nostrPrivateKey == "" {
		log.Fatal("NOSTR_PRIVATE_KEY environment variable is required")
	}

	ctx := context.Background()

	client, err := nostr.NewClient(ctx, nostrPrivateKey)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	indexer, err := nostr.NewIndexer("./notes/index")
	if err != nil {
		log.Fatal(err)
	}
	defer indexer.Close()

	// TODO: load notes
	for _, note := range []nostr.Note{} {
		event, err := client.NewEvent(note)
		if err != nil {
			log.Printf("Failed creating event %q: %v\n", event.ID, err)
			log.Println(err)
			continue
		}

		if err := client.Publish(ctx, event); err != nil {
			log.Printf("Failed publishing event %q: %v\n", event.ID, err)
			continue
		}

		if err := indexer.Index(event); err != nil {
			log.Printf("Failed indexing event %q: %v\n", event.ID, err)
			continue
		}
	}
}
