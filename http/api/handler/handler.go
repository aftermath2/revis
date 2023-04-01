package handler

import (
	"encoding/json"
	"net/http"

	"github.com/aftermath2/revis/nostr"
)

// ErrorResponse is the object returned when an error is thrown.
type ErrorResponse struct {
	Error string `json:"error,omitempty"`
}

// Handler handles endpoints requests.
type Handler struct {
	nostrClient nostr.Client
}

// New returns the endpoints handler.
func New(nostrClient nostr.Client) *Handler {
	return &Handler{
		nostrClient: nostrClient,
	}
}

func sendResponse(w http.ResponseWriter, statusCode int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, "failed encoding response body", http.StatusInternalServerError)
	}
}

func sendError(w http.ResponseWriter, statusCode int, err error) {
	errResponse := ErrorResponse{
		Error: err.Error(),
	}
	sendResponse(w, statusCode, errResponse)
}
