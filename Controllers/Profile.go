package controllers

import (
	"encoding/json"
	models "main/Models"
	"net/http"
	"strings"
)

func Me(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := models.Database.QueryRow("SELECT id, email, username, profile_picture FROM users WHERE email = ?", models.ThisUser.Email).Scan(&user.Id, &user.Email, &user.Username, &user.ProfilePicture)
	if err != nil {
		http.Error(w, "Database query error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
}

func Update(w http.ResponseWriter, r *http.Request) {
	var userDatas models.User
	err := json.NewDecoder(r.Body).Decode(&userDatas)

	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	updateQuery := "UPDATE users SET"
	updateParams := make([]interface{}, 0)

	if userDatas.Username != "" {
		updateQuery += " username = ?,"
		updateParams = append(updateParams, userDatas.Username)
	}

	if userDatas.ProfilePicture != "" {
		updateQuery += " profile_picture = ?,"
		updateParams = append(updateParams, userDatas.ProfilePicture)
	}

	if userDatas.Email != "" {
		updateQuery += " email = ?,"
		updateParams = append(updateParams, userDatas.Email)
	}

	// Remove the trailing comma
	updateQuery = strings.TrimSuffix(updateQuery, ",")

	updateQuery += " WHERE id = ?"
	updateParams = append(updateParams, models.ThisUser.Id)

	_, err = models.Database.Exec(updateQuery, updateParams...)

	if err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	_, tokenString, _ := models.TokenAuth.Encode(map[string]interface{}{"email": userDatas.Email})

	// Prepare the response
	response := map[string]interface{}{
		"token": tokenString,
		"user":  userDatas,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
