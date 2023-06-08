package database

import (
	"log"
	models "main/Models"
)

func Migrate() {
	var err error
	_, err = models.Database.Exec(`CREATE TABLE IF NOT EXISTS users (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
		email TEXT,
		password TEXT,
		username TEXT,
		profile_picture TEXT DEFAULT "https://visitemaroc.ca/wp-content/uploads/2021/06/profile-placeholder.png"
	)`)

	if err != nil {
		log.Fatal(err)
	}

	_, err = models.Database.Exec(`CREATE TABLE IF NOT EXISTS posts (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
		user_id INTEGER NOT NULL,
		content TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users (id)
	)`)

	if err != nil {
		log.Fatal(err)
	}

	_, err = models.Database.Exec(`CREATE TABLE IF NOT EXISTS comments (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
		post_id INTEGER NOT NULL,
		user_id INTEGER NOT NULL,
		content TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users (id)
		FOREIGN KEY (post_id) REFERENCES post (id)
	)`)

	if err != nil {
		log.Fatal(err)
	}
}