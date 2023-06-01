package models

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3" // Import go-sqlite3 library
)

type User struct {
	Id              int
	Email           string
	Password        string
	Username        string
	Profile_picture string
}

// Création de la table user
func MigrateUsers(Database *sql.DB) {
	request := `CREATE TABLE user (
		"id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,		
		"email" TEXT,
		"password" TEXT,
		"username" TEXT,
		"profile_picture" TEXT DEFAULT "https://visitemaroc.ca/wp-content/uploads/2021/06/profile-placeholder.png"
	  );`

	log.Println("> Create user table...")

	statement, err := Database.Prepare(request) // Prepare SQL Statement

	if err != nil {
		log.Fatal(err.Error())
	}

	statement.Exec() // Execute SQL Statements

	log.Println("> user table created !")
}

// Création de fausses donnés pour tests
func SeedUsers() {

}
