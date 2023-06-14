package main

import (
	"database/sql"
	"fmt"
	"log"
	controllers "main/Controllers"
	comments "main/Controllers/Comments"
	posts "main/Controllers/Posts"
	helpers "main/Helpers"
	middlewares "main/Middlewares"
	models "main/Models"
	"main/database"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

const (
	dbPath = "./database/forum.db"
)

func init() {
	helpers.LoadEnv()

	// Generate secrete key
	if len(os.Getenv("SECRETE_KEY")) == 0 {
		env, _ := godotenv.Unmarshal("SECRETE_KEY=" + helpers.GenerateRandomKey(32))
		_ = godotenv.Write(env, "./.env")

		log.Println("Secret key set successfully.")
		helpers.LoadEnv()
	}

	var err error
	models.Database, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal("Database connection error")
		return
	}
}

func main() {
	//Migrate database
	database.Migrate()

	// Initialize JWT authentication
	models.TokenAuth = jwtauth.New("HS256", []byte(os.Getenv("SECRETE_KEY")), nil)

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Route("/api", func(r chi.Router) {
		// Public
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", controllers.Register)
			r.Post("/login", controllers.Login)
		})

		// Non authentifié
		r.Route("/posts", func(r chi.Router) {
			r.Get("/", posts.Index)
			r.Post("/view/{postId}", posts.View)
		})

		// Private
		r.Route("/", func(r chi.Router) {
			r.Use(jwtauth.Verifier(models.TokenAuth))
			r.Use(jwtauth.Authenticator)
			r.Use(middlewares.SetUserMail)

			// Profile datas
			r.Get("/me", controllers.Me)

			r.Route("/post", func(r chi.Router) {
				r.Post("/", posts.Create)

				r.Route("/{postId}", func(r chi.Router) {
					r.Use(middlewares.SetPostCtx)

					r.Get("/", posts.Show)      // GET /articles/123
					r.Delete("/", posts.Delete) // DELETE /articles/123
				})
			})

			r.Route("/comment", func(r chi.Router) {
				r.Post("/", comments.Create)
				r.Delete("/{commentId}", comments.Delete)
			})
		})
	})

	chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		fmt.Printf("[%s]: '%s'\n", method, route)
		return nil
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
