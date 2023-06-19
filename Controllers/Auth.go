package controllers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	helpers "main/Helpers"
	models "main/Models"
	"net/http"
	"net/url"
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

const (
	GithubClientID     = "d8136884ff4675d74c9a"
	GithubClientSecret = "40da0ab806fe534843d58d174f1401b5cf24412c"
	GithubRedirectURI  = "http://localhost:3000/callback-github"

	DiscordClientID     = "1120336930433925240"
	DiscordClientSecret = "1g7ZwcOYgVXC7-jGul3GJ6qILTbDky2B"
	DiscordRedirectURI  = "http://localhost:3000/callback-discord"
)

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
	fmt.Println("Github -----------")

	fmt.Println("Access Token:", token.AccessToken)
	fmt.Println("Token Type:", token.TokenType)
	fmt.Println("Scope:", token.Scope)

	fmt.Println("Login:", userData.UserName)
	fmt.Println("Avatar URL:", userData.AvatarURL)
	fmt.Println("Email:", userData.Email)

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
	fmt.Println("Discord -----------")
	fmt.Println("Access Token:", token.AccessToken)
	fmt.Println("Token Type:", token.TokenType)
	fmt.Println("Scope:", token.Scope)

	fmt.Println("Email:", userData.Email)
	fmt.Println("Profile Image:", userData.ProfileImage)
	fmt.Println("Username:", userData.Username)

	authUser(w, r, models.User{
		Email:          userData.Email,
		Username:       userData.Username,
		ProfilePicture: userData.Avatar,
	})
}

func exchangeGithubCodeForToken(code string) (GithubTokenResponse, error) {
	data := url.Values{
		"client_id":     {GithubClientID},
		"client_secret": {GithubClientSecret},
		"code":          {code},
		"redirect_uri":  {GithubRedirectURI},
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

	return userData, nil
}

func exchangeDiscordCodeForToken(code string) (DiscordTokenResponse, error) {
	data := url.Values{
		"client_id":     {DiscordClientID},
		"client_secret": {DiscordClientSecret},
		"code":          {code},
		"redirect_uri":  {DiscordRedirectURI},
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
	// fmt.Println("discord body: ----q--s-s-d-d- =", (userData))

	userData.ProfileImage = "https://cdn.discordapp.com/avatars/" + userData.Id + "/" + userData.Avatar + ".png"

	return userData, nil
}

func authUser(w http.ResponseWriter, r *http.Request, userData models.User) {

	var user models.User
	err := models.Database.QueryRow("SELECT * FROM users WHERE email = ?", userData.Email).Scan(&user.Id, &user.Email, &user.Username, &user.ProfilePicture)
	if err != nil {
		// User does not exist, perform registration
		user = models.User{
			Email:          userData.Email,
			Username:       userData.Username,
			ProfilePicture: userData.ProfilePicture,
		}

		// Insert new user
		_, err = models.Database.Exec("INSERT INTO users (email, username, profile_picture) VALUES (?, ?, ?)",
			user.Email, user.Username, user.ProfilePicture)
		if err != nil {
			http.Error(w, "Database insert error", http.StatusInternalServerError)
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
