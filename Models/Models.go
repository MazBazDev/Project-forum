package models

import (
	"database/sql"

	"github.com/go-chi/jwtauth"
)

type User struct {
	Id             int    `json:"id"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Username       string `json:"username"`
	ProfilePicture string `json:"profile_picture"`
}

type Credentials struct {
	Password string `json:"password"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

var Database *sql.DB
var TokenAuth *jwtauth.JWTAuth
