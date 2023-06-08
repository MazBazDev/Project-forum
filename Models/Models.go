package models

import (
	"database/sql"

	"github.com/go-chi/jwtauth"
)

var Database *sql.DB
var TokenAuth *jwtauth.JWTAuth
var ThisUser User

type User struct {
	Id             int    `json:"id"`
	Email          string `json:"email"`
	Password       string `json:"password,omitempty"`
	Username       string `json:"username"`
	ProfilePicture string `json:"profile_picture"`
}

type Credentials struct {
	Password string `json:"password"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

type Posts struct {
	Posts []Post `json:"posts"`
}

type Post struct {
	Id         int       `json:"id"`
	Content    string    `json:"content"`
	Created_at string    `json:"created_at"`
	User       User      `json:"user"`
	Comments   []Comment `json:"comments"`
}

type Comment struct {
	Id         int    `json:"id"`
	PostId     int    `json:"post_id,omitempty"`
	Content    string `json:"content"`
	Created_at string `json:"created_at"`
	User       User   `json:"user"`
}
