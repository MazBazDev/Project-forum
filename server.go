package main

import (
	"database/sql"
	"log"
	controllers "main/Controllers"
	helpers "main/Helpers"
	models "main/Models"
	"main/database"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
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
	models.TokenAuth = jwtauth.New("HS256", []byte(os.Getenv("SECRET_KEY")), nil)

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Post("/register", controllers.Register)
	r.Post("/login", controllers.Login)

	r.Route("/me", func(r chi.Router) {
		r.Use(jwtauth.Verifier(models.TokenAuth))
		r.Use(jwtauth.Authenticator)

		r.Get("/", controllers.Me)
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
