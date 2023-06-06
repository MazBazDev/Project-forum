package middlewares

import (
	"log"
	models "main/Models"
	"net/http"

	"github.com/go-chi/jwtauth"
)

func SetUserMail(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, claims, _ := jwtauth.FromContext(r.Context())
		email := claims["email"].(string)

		err := models.Database.QueryRow("SELECT id, email, profile_picture FROM users WHERE email = ?", email).Scan(&models.ThisUser.Id, &models.ThisUser.Email, &models.ThisUser.ProfilePicture)

		if err != nil {
			log.Println(err)
		}

		next.ServeHTTP(w, r)
	})
}
