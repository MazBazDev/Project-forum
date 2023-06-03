package models

import (
	"log"
	database "main/Database"

	_ "github.com/mattn/go-sqlite3" // Import go-sqlite3 library
)

type User struct {
	Id              int
	Email           string
	Jwt             string
	Username        string
	Profile_picture string
}

func CreateUser(email, password, username, profile_picture string) {
	request := `INSERT INTO user(email, password, username, profile_picture) VALUES (?, ?, ?, ?)`

	statement, err := database.Database.Prepare(request) // Prepare statement.

	if err != nil {
		log.Fatalln(err.Error())
	}

	_, err = statement.Exec(email, password, username, profile_picture)

	if err != nil {
		log.Fatalln(err.Error())
	}
}

func EmailExists(email string) bool {
	query := "SELECT COUNT(*) FROM user WHERE email = ?"
	var count int

	err := database.Database.QueryRow(query, email).Scan(&count)
	if err != nil {
		log.Fatal(err.Error())
	}

	return count > 0
}
