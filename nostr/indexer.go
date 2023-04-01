package nostr

import (
	"os"

	"github.com/blevesearch/bleve/v2"
	"github.com/nbd-wtf/go-nostr"
)

// Indexer is the interface to the nostr events  storage
type Indexer interface {
	Open() error
	Close() error
	Index(event nostr.Event) error
	Search(query string) ([]nostr.Event, error)
}

type indexer struct {
	path  string
	index bleve.Index
}

func NewIndexer(path string) (Indexer, error) {
	return &indexer{path: path}, nil
}

func (i *indexer) Close() error {
	return i.index.Close()
}

func (i *indexer) Open() error {
	if _, err := os.Stat(i.path); err == nil {
		index, err := bleve.Open(i.path)
		if err != nil {
			return err
		}

		i.index = index
		return nil
	}

	/*
		Document mapping:
			i = ID
			t = Title
			c = Content
			k = Kind
			p = Pubkey
			C = Categories
			a = created_at
	*/
	docMapping := bleve.NewDocumentMapping()
	docMapping.AddFieldMappingsAt("i", bleve.NewTextFieldMapping())
	docMapping.AddFieldMappingsAt("t", bleve.NewTextFieldMapping())
	docMapping.AddFieldMappingsAt("c", bleve.NewTextFieldMapping())
	docMapping.AddFieldMappingsAt("k", bleve.NewTextFieldMapping())
	docMapping.AddFieldMappingsAt("p", bleve.NewTextFieldMapping())
	docMapping.AddFieldMappingsAt("C", bleve.NewKeywordFieldMapping())
	docMapping.AddFieldMappingsAt("a", bleve.NewDateTimeFieldMapping())

	mapping := bleve.NewIndexMapping()
	mapping.AddDocumentMapping("event", docMapping)

	index, err := bleve.New(i.path, mapping)
	if err != nil {
		return err
	}

	i.index = index
	return nil
}

func (i *indexer) Index(event nostr.Event) error {
	return i.index.Index(event.ID, event)
}

func (i *indexer) Search(query string) ([]nostr.Event, error) {
	request := bleve.NewSearchRequest(bleve.NewQueryStringQuery(query))

	results, err := i.index.Search(request)
	if err != nil {
		return nil, err
	}

	// TODO: parse to nostr notes
	_ = results.Hits

	return []nostr.Event{}, nil
}
