package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	helpers "main/Helpers"
	models "main/Models"
	"net/http"
	"net/url"
	"os"
	"strings"
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

type GithubTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

type GithubUserData struct {
	UserName  string `json:"login"`
	AvatarURL string `json:"avatar_url"`
	Email     string `json:"email"`
}

type DiscordTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

type DiscordUserData struct {
	Id           string `json:"id"`
	Avatar       string `json:"avatar"`
	Email        string `json:"email"`
	ProfileImage string `json:"profile_image"`
	Username     string `json:"username"`
}

func GithubCallback(w http.ResponseWriter, r *http.Request) {
	type Code struct {
		Code string `json:"code"`
	}
	var code Code

	err := json.NewDecoder(r.Body).Decode(&code)
	if err != nil {
		fmt.Println(err)
	}

	token, err := exchangeGithubCodeForToken(code.Code)
	if err != nil {
		fmt.Println(err)
	}

	userData, err := getGithubUserData(token.AccessToken)
	if err != nil {
		fmt.Println(err)
	}

	authUser(w, r, models.User{
		Email:          userData.Email,
		Username:       userData.UserName,
		ProfilePicture: userData.AvatarURL,
	})
}

func DiscordCallback(w http.ResponseWriter, r *http.Request) {
	type Code struct {
		Code string `json:"code"`
	}
	var code Code

	err := json.NewDecoder(r.Body).Decode(&code)
	if err != nil {
		fmt.Println(err)
	}

	token, err := exchangeDiscordCodeForToken(code.Code)
	if err != nil {
		fmt.Println(err)
	}

	userData, err := getDiscordUserData(token.AccessToken)
	if err != nil {
		fmt.Println(err)
	}

	authUser(w, r, models.User{
		Email:          userData.Email,
		Username:       userData.Username,
		ProfilePicture: userData.Avatar,
	})
}

func exchangeGithubCodeForToken(code string) (GithubTokenResponse, error) {
	data := url.Values{
		"client_id":     {os.Getenv("GithubClientID")},
		"client_secret": {os.Getenv("GithubClientSecret")},
		"code":          {code},
		"redirect_uri":  {os.Getenv("GithubRedirectURI")},
		"grant_type":    {"authorization_code"},
		"scope":         {"user:email"},
	}

	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return GithubTokenResponse{}, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return GithubTokenResponse{}, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return GithubTokenResponse{}, fmt.Errorf("error reading response: %v", err)
	}

	var tokenResponse GithubTokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return GithubTokenResponse{}, fmt.Errorf("error decoding JSON: %v", err)
	}

	return tokenResponse, nil
}

func getGithubUserData(accessToken string) (GithubUserData, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error reading response: %v", err)
	}

	var userData GithubUserData
	err = json.Unmarshal(body, &userData)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error decoding JSON: %v", err)
	}

	// Récupérer l'e-mail principal depuis l'API /user/emails
	emailsURL := "https://api.github.com/user/emails"

	emailsReq, err := http.NewRequest("GET", emailsURL, nil)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error creating request for /user/emails: %v", err)
	}

	emailsReq.Header.Set("Authorization", "Bearer "+accessToken)

	emailsResp, err := client.Do(emailsReq)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error sending request for /user/emails: %v", err)
	}
	defer emailsResp.Body.Close()

	emailsBody, err := ioutil.ReadAll(emailsResp.Body)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error reading response for /user/emails: %v", err)
	}

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	err = json.Unmarshal(emailsBody, &emails)
	if err != nil {
		return GithubUserData{}, fmt.Errorf("error decoding JSON for /user/emails: %v", err)
	}

	// Trouver l'e-mail principal dans la liste des e-mails
	var primaryEmail string
	for _, email := range emails {
		if email.Primary {
			primaryEmail = email.Email
			break
		}
	}

	// Ajouter l'e-mail principal à la structure de données de l'utilisateur GitHub
	userData.Email = primaryEmail

	return userData, nil
}

func exchangeDiscordCodeForToken(code string) (DiscordTokenResponse, error) {
	data := url.Values{
		"client_id":     {os.Getenv("DiscordClientID")},
		"client_secret": {os.Getenv("DiscordClientSecret")},
		"code":          {code},
		"redirect_uri":  {os.Getenv("DiscordRedirectURI")},
		"grant_type":    {"authorization_code"},
		"scope":         {"identify", "email"},
	}

	req, err := http.NewRequest("POST", "https://discord.com/api/v10/oauth2/token", strings.NewReader(data.Encode()))
	if err != nil {
		return DiscordTokenResponse{}, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return DiscordTokenResponse{}, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return DiscordTokenResponse{}, fmt.Errorf("error reading response: %v", err)
	}

	var tokenResponse DiscordTokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return DiscordTokenResponse{}, fmt.Errorf("error decoding JSON: %v", err)
	}

	return tokenResponse, nil
}

func getDiscordUserData(accessToken string) (DiscordUserData, error) {
	req, err := http.NewRequest("GET", "https://discord.com/api/v10/users/@me", nil)
	if err != nil {
		return DiscordUserData{}, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return DiscordUserData{}, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return DiscordUserData{}, fmt.Errorf("error reading response: %v", err)
	}

	var userData DiscordUserData
	err = json.Unmarshal(body, &userData)
	if err != nil {
		return DiscordUserData{}, fmt.Errorf("error decoding JSON: %v", err)
	}

	userData.ProfileImage = "https://cdn.discordapp.com/avatars/" + userData.Id + "/" + userData.Avatar + ".png"

	return userData, nil
}

func authUser(w http.ResponseWriter, r *http.Request, userData models.User) {
	var user models.User
	err := models.Database.QueryRow("SELECT id, email, username, profile_picture FROM users WHERE email = ?", userData.Email).Scan(&user.Id, &user.Email, &user.Username, &user.ProfilePicture)
	if err != nil {
		// Erreur lors de la recherche de l'utilisateur dans la base de données
		if err == sql.ErrNoRows {
			// L'utilisateur n'existe pas, effectuer l'inscription

			user = models.User{
				Email:          userData.Email,
				Username:       userData.Username,
				ProfilePicture: userData.ProfilePicture,
			}

			// Insérer un nouvel utilisateur
			_, err = models.Database.Exec("INSERT INTO users (email, username, profile_picture) VALUES (?, ?, ?)",
				user.Email, user.Username, user.ProfilePicture)
			if err != nil {

				// Gérer l'erreur d'insertion dans la base de données
				if strings.Contains(err.Error(), "UNIQUE constraint failed") {
					// L'email existe déjà, gérer le cas approprié
					http.Error(w, "User already exists", http.StatusBadRequest)
					return
				}

				http.Error(w, "Database insert error", http.StatusInternalServerError)
				return
			}
		} else {
			// Autre erreur lors de la recherche de l'utilisateur
			http.Error(w, "Database query error", http.StatusInternalServerError)
			return
		}
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
