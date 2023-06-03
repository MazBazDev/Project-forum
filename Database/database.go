package database

import (
	"database/sql"
	"log"

	"os"

	_ "github.com/mattn/go-sqlite3" // Import go-sqlite3 library
)

const db_dir string = "./Database/forum-database.db"

var Database, _ *sql.DB

// Initialisation de la bdd, création de l'accesseur
func Initialize(reset bool) {
	if _, err := os.Stat(db_dir); err == nil {
		if reset {
			err := os.Remove(db_dir)
			if err != nil {
				log.Fatal(err.Error())
			}
		} else {
			log.Println("Database already exists. Skipping creation.")
			return
		}
	}

	log.Println("Creating " + db_dir)

	file, err := os.Create(db_dir) // Create SQLite file
	if err != nil {
		log.Fatal(err.Error())
	}
	file.Close()

	log.Println(db_dir + " created!")

	Database, err = sql.Open("sqlite3", db_dir) // Open the created SQLite File
	if err != nil {
		log.Fatal(err.Error())
	}

	// Exécuter la migration pour la table "user"
	migrateUsers()
}

// Création de la table user
func migrateUsers() {
	request := `CREATE TABLE user (
		"id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,		
		"email" TEXT,
		"password" TEXT,
		"username" TEXT,
		"jwt" TEXT,
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

func displayStudents(db *sql.DB) {
	row, err := db.Query("SELECT * FROM student ORDER BY name")
	if err != nil {
		log.Fatal(err)
	}
	defer row.Close()
	for row.Next() { // Iterate and fetch the records from result cursor
		var id int
		var code string
		var name string
		var program string
		row.Scan(&id, &code, &name, &program)
		log.Println("Student: ", code, " ", name, " ", program)
	}
}
