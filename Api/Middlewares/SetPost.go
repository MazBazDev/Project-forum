package middlewares

import (
	"context"
	posts "main/Controllers/Posts"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
)

func SetPostCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		postID := chi.URLParam(r, "postId")

		id, _ := strconv.Atoi(postID)

		post, err := posts.GetPostById(id)
		if err != nil {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		ctx := context.WithValue(r.Context(), "post", post)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
