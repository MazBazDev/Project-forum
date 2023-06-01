package users

import (
	"log"
	models "main/Models"
	"main/database"
)

// Création d'un utilisateur
func CreateUser(email, password, username, profile_picture string) {
	request := `INSERT INTO student(email, password, username, profile_picture) VALUES (?, ?, ?, ?)`

	statement, err := database.Database.Prepare(request) // Prepare statement.

	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(email, password, username, profile_picture)

	if err != nil {
		log.Fatalln(err.Error())
	}
}

// Récupérer l'instance d'un user via id
func GetUser(withComments bool) models.User {
	return models.User{}
}

// Supprimer un user via id
func DeleteUser() {

}

// Editer un user via id
func EditUser() {

}
