package controllers

import (
	"encoding/json"
	helpers "main/Helpers"
	models "main/Models"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var credentials models.Credentials
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid request payload login", http.StatusBadRequest)
		return
	}

	var user models.User
	err = models.Database.QueryRow("SELECT * FROM users WHERE email = ?", credentials.Email).Scan(&user.Id, &user.Email, &user.Password, &user.Username, &user.ProfilePicture)

	if err != nil || !helpers.CheckPasswordHash(credentials.Password, user.Password) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate and return JWT token
	_, tokenString, _ := models.TokenAuth.Encode(map[string]interface{}{"email": user.Email})

	// Prepare the response
	response := map[string]interface{}{
		"token": tokenString,
		"user":  user,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	var count int
	err = models.Database.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", user.Email).Scan(&count)
	if err != nil {
		http.Error(w, "Database query error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	// hash password
	pswd, _ := helpers.HashPassword(user.Password)

	// Insert new user
	_, err = models.Database.Exec("INSERT INTO users (email, password, username) VALUES (?, ?, ?)",
		user.Email, pswd, user.Username)
	if err != nil {
		http.Error(w, "Database insert error", http.StatusInternalServerError)
		return
	}

	// Generate and return JWT token
	_, tokenString, _ := models.TokenAuth.Encode(map[string]interface{}{"email": user.Email})

	// Prepare the response
	response := map[string]interface{}{
		"token": tokenString,
		"user":  user,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
