package controllers

import (
	"encoding/json"
	models "main/Models"
	"net/http"

	"github.com/go-chi/jwtauth"
)

func Me(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())

	email := claims["email"].(string)

	var user models.User
	err := models.Database.QueryRow("SELECT email, username FROM users WHERE email = ?", email).Scan(&user.Email, &user.Username)
	if err != nil {
		http.Error(w, "Database query error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
}
