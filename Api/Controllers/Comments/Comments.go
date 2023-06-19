package comments

import (
	"encoding/json"
	models "main/Models"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
)

func Create(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload post", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`
	res, err := models.Database.Exec(query, comment.PostId, models.ThisUser.Id, comment.Content)
	if err != nil {
		http.Error(w, "Database insert error", http.StatusInternalServerError)
		return
	}

	lastId, _ := res.LastInsertId()

	_, err = models.Database.Exec("INSERT INTO coordinates (comment_id, city, lat, long) VALUES (?, ?, ?, ?)", lastId, comment.Coordinates.City, comment.Coordinates.Lat, comment.Coordinates.Long)
	if err != nil {
		http.Error(w, "Database insert error comment insert", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func Delete(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "commentId")
	id, _ := strconv.Atoi(commentID)

	_, userId, err := getCommentById(id)
	if err != nil {
		http.Error(w, http.StatusText(404), 404)
		return
	}

	if userId != models.ThisUser.Id {
		http.Error(w, http.StatusText(401), 401)
		return
	}

	// Supprimer le post de la base de données en utilisant l'ID du post
	_, err = models.Database.Exec("DELETE FROM comments WHERE id = ?", id)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetCommentsByPostID(postID int) ([]models.Comment, error) {
	// Déclaration d'une variable pour stocker les commentaires
	var comments []models.Comment
	query := `
		SELECT comments.id, comments.content, comments.created_at, users.id, users.email, users.username, users.profile_picture, c.city, c.lat, c.long 
		FROM comments
		INNER JOIN users ON comments.user_id = users.id
		INNER JOIN coordinates c ON comments.id = c.comment_id
		WHERE comments.post_id = ?`

	// Exécution de la requête SQL pour récupérer les commentaires
	rows, err := models.Database.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.Comment

		err := rows.Scan(&comment.Id, &comment.Content, &comment.Created_at, &comment.User.Id, &comment.User.Email, &comment.User.Username, &comment.User.ProfilePicture, &comment.Coordinates.City, &comment.Coordinates.Lat, &comment.Coordinates.Long)
		if err != nil {
			return nil, err
		}

		// Ajout du commentaire à la liste
		comments = append(comments, comment)
	}

	// Vérification des erreurs lors du parcours des lignes
	err = rows.Err()
	if err != nil {
		return nil, err
	}

	// Retourne le tableau de commentaires
	return comments, nil
}

func getCommentById(id int) (int, int, error) {
	var commentId, userId int

	row := models.Database.QueryRow("SELECT id, user_id FROM comments WHERE id = ?", id)

	err := row.Scan(&commentId, &userId)
	if err != nil {
		return 0, 0, err
	}

	return commentId, userId, nil
}
