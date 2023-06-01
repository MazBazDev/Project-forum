package database

import (
	"database/sql"
	"log"
	models "main/Models"

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
	models.MigrateUsers(Database)
}

func insertStudent(db *sql.DB, code string, name string, program string) {
	log.Println("Inserting student record ...")
	insertStudentSQL := `INSERT INTO student(code, name, program) VALUES (?, ?, ?)`
	statement, err := db.Prepare(insertStudentSQL) // Prepare statement.
	// This is good to avoid SQL injections
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(code, name, program)
	if err != nil {
		log.Fatalln(err.Error())
	}
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
