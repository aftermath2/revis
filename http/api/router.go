package api

import (
	"net/http"

	"github.com/aftermath2/revis/http/api/handler"
	"github.com/aftermath2/revis/http/api/middlewares"
	"github.com/aftermath2/revis/nostr"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Router implements http.Handler and io.Closer interfaces.
type Router interface {
	http.Handler
}

type router struct {
	mux *chi.Mux
}

func NewRouter(nostrClient nostr.Client) Router {
	mux := chi.NewRouter()
	mux.Use(middleware.Logger, middlewares.Cors)

	handler := handler.New(nostrClient)

	_ = handler

	return &router{mux: mux}
}

func (rr *router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	rr.mux.ServeHTTP(w, r)
}
