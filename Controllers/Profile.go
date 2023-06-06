package controllers

import (
	"encoding/json"
	models "main/Models"
	"net/http"
)

func Me(w http.ResponseWriter, r *http.Request) {

	var user models.User
	err := models.Database.QueryRow("SELECT email, username FROM users WHERE email = ?", models.ThisUser.Email).Scan(&user.Email, &user.Username)
	if err != nil {
		http.Error(w, "Database query error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
}
