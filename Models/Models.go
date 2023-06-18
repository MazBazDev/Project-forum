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

type Coordinates struct {
	Id    string  `json:"id"`
	City  string  `json:"city"`
	Lat   float64 `json:"lat"`
	Long  float64 `json:"long"`
	Posts []Post  `json"posts,omitempty"`
}

type Posts struct {
	Posts []Post `json:"posts"`
}

type Post struct {
	Id          int         `json:"id"`
	Title       string      `json:"title"`
	Content     string      `json:"content"`
	Created_at  string      `json:"created_at"`
	Categories  []Caterogy  `json:"categories"`
	User        User        `json:"user"`
	Coordinates Coordinates `json:"coordinates"`
	Comments    []Comment   `json:"comments"`
	Views       int         `json:"views"`
}

type Comment struct {
	Id          int         `json:"id"`
	PostId      int         `json:"post_id,omitempty"`
	Content     string      `json:"content"`
	Created_at  string      `json:"created_at"`
	User        User        `json:"user"`
	Coordinates Coordinates `json:"coordinates"`
}

type View struct {
	Id     int `json:"id"`
	PostId int `json:"post_id"`
	IP     string
}

type Caterogy struct {
	Id    int    `json:"id"`
	Title string `json:"title"`
	Posts []Post `json"posts,omitempty"`
}

type Searchable struct {
	Users  []User `json:"users"`
	Topics []Post `json:"topics"`
}
