package database

import (
	"log"
	models "main/Models"
)

func Migrate() {
	_, err := models.Database.Exec(`CREATE TABLE IF NOT EXISTS users (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
		email TEXT,
		password TEXT,
		username TEXT,
		profile_picture TEXT
	)`)
	if err != nil {
		log.Fatal(err)
	}
}
