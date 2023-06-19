package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	helpers "main/Helpers"
	models "main/Models"
	"net/http"
	"net/url"
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

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

func Github(w http.ResponseWriter, r *http.Request) {
	type Code struct {
		Code string `json:"code"`
	}
	var code Code

	err := json.NewDecoder(r.Body).Decode(&code)
	if err != nil {
		fmt.Println(err)
	}

	// Définir les données de la requête POST
	data := url.Values{
		"client_id":     {"d8136884ff4675d74c9a"},
		"client_secret": {"40da0ab806fe534843d58d174f1401b5cf24412c"},
		"code":          {code.Code},
	}
	// Créer une requête POST
	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBufferString(data.Encode()))
	if err != nil {
		fmt.Errorf("erreur lors de la création de la requête: %v", err)
	}

	// Définir les en-têtes de la requête
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	// Envoyer la requête HTTP
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Errorf("erreur lors de l'envoi de la requête: %v", err)
	}
	defer resp.Body.Close()

	// Lire la réponse
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Errorf("erreur lors de la lecture de la réponse: %v", err)
	}

	// Déclarer une variable pour stocker la réponse
	var response AccessTokenResponse

	// Décoder la réponse JSON dans la structure
	err = json.Unmarshal(body, &response)
	if err != nil {
		fmt.Errorf("erreur lors du décodage JSON: %v", err)
	}

	// Retourner la réponse et aucune erreur
	fmt.Println("Access Token:", response.AccessToken)
	fmt.Println("Token Type:", response.TokenType)
	fmt.Println("Scope:", response.Scope)

	getUserDataAndAuthenticate(w, r, response)
}

func getUserDataAndAuthenticate(w http.ResponseWriter, r *http.Request, accessToken AccessTokenResponse) {

	userData, err := getUserDatas(accessToken)
	if err != nil {
		http.Error(w, "Failed to retrieve user data", http.StatusInternalServerError)
		return
	}

	// Check if user already exists
	var user models.User
	err = models.Database.QueryRow("SELECT * FROM users WHERE email = ?", userData.Email).Scan(&user.Id, &user.Email, &user.Username, &user.ProfilePicture)
	if err != nil {
		// User does not exist, perform registration
		user = models.User{
			Email:          userData.Email,
			Username:       userData.Login,
			ProfilePicture: userData.AvatarURL,
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

type UserData struct {
	Login     string `json:"login"`
	AvatarURL string `json:"avatar_url"`
	Email     string `json:"email"`
}

func getUserDatas(datas AccessTokenResponse) (UserData, error) {
	// Récupérer les données de l'utilisateur depuis l'API /user
	userURL := "https://api.github.com/user"

	// Créer une requête GET pour l'API /user
	userReq, err := http.NewRequest("GET", userURL, nil)
	if err != nil {
		fmt.Println("Erreur lors de la création de la requête pour /user:", err)
		return UserData{}, err
	}

	// Ajouter l'en-tête Authorization avec la valeur Bearer YOUR_ACCESS_TOKEN
	userReq.Header.Set("Authorization", "Bearer "+datas.AccessToken)

	// Envoyer la requête GET à l'API /user
	client := &http.Client{}
	userResp, err := client.Do(userReq)
	if err != nil {
		fmt.Println("Erreur lors de l'envoi de la requête pour /user:", err)
		return UserData{}, err
	}
	defer userResp.Body.Close()

	// Lire la réponse de l'API /user
	userBody, err := ioutil.ReadAll(userResp.Body)
	if err != nil {
		fmt.Println("Erreur lors de la lecture de la réponse de l'API /user:", err)
		return UserData{}, err
	}

	// Récupérer le login et l'avatar_url depuis la réponse JSON de l'API /user
	var userData UserData
	err = json.Unmarshal(userBody, &userData)
	if err != nil {
		fmt.Println("Erreur lors de l'analyse de la réponse JSON de l'API /user:", err)
		return UserData{}, err
	}

	// Récupérer l'e-mail principal depuis l'API /user/emails
	emailsURL := "https://api.github.com/user/emails"

	// Créer une requête GET pour l'API /user/emails
	emailsReq, err := http.NewRequest("GET", emailsURL, nil)
	if err != nil {
		fmt.Println("Erreur lors de la création de la requête pour /user/emails:", err)
		return UserData{}, err
	}

	// Ajouter l'en-tête Authorization avec la valeur Bearer YOUR_ACCESS_TOKEN
	emailsReq.Header.Set("Authorization", "Bearer "+datas.AccessToken)

	// Envoyer la requête GET à l'API /user/emails
	emailsResp, err := client.Do(emailsReq)
	if err != nil {
		fmt.Println("Erreur lors de l'envoi de la requête pour /user/emails:", err)
		return UserData{}, err
	}
	defer emailsResp.Body.Close()

	// Lire la réponse de l'API /user/emails
	emailsBody, err := ioutil.ReadAll(emailsResp.Body)
	if err != nil {
		fmt.Println("Erreur lors de la lecture de la réponse de l'API /user/emails:", err)
		return UserData{}, err
	}

	// Récupérer l'e-mail principal depuis la réponse JSON de l'API /user/emails
	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	err = json.Unmarshal(emailsBody, &emails)
	if err != nil {
		fmt.Println("Erreur lors de l'analyse de la réponse JSON de l'API /user/emails:", err)
		return UserData{}, err
	}

	// Trouver l'e-mail principal dans la liste des e-mails
	var primaryEmail string
	for _, email := range emails {
		if email.Primary {
			primaryEmail = email.Email
			break
		}
	}

	// Stocker les données récupérées dans une structure UserData
	userData.Email = primaryEmail

	// Afficher les données récupérées
	fmt.Printf("Login: %s\n", userData.Login)
	fmt.Printf("Avatar URL: %s\n", userData.AvatarURL)
	fmt.Printf("E-mail: %s\n", userData.Email)

	return userData, nil
}
