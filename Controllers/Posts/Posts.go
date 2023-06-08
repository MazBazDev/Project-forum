package posts

import (
	"encoding/json"
	"fmt"
	comments "main/Controllers/Comments"
	models "main/Models"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request) {
	posts, err := GetAllPosts()

	if err != nil {
		http.Error(w, http.StatusText(422), 422)
		return
	}

	postsJSON, err := json.Marshal(posts)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Écrire la réponse JSON dans la réponse HTTP
	w.Header().Set("Content-Type", "application/json")
	w.Write(postsJSON)
	w.WriteHeader(http.StatusOK)
}

func Create(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		http.Error(w, "Invalid request payload post", http.StatusBadRequest)
		return
	}

	res, err := models.Database.Exec("INSERT INTO posts (content, user_id) VALUES (?, ?)", post.Content, models.ThisUser.Id)
	if err != nil {
		http.Error(w, "Database insert error 1", http.StatusInternalServerError)
		return
	}

	lastId, _ := res.LastInsertId()

	_, err = models.Database.Exec("INSERT INTO coordinates (post_id, city, lat, long) VALUES (?, ?, ?, ?)", lastId, post.Coordinates.City, post.Coordinates.Lat, post.Coordinates.Long)
	if err != nil {
		http.Error(w, "Database insert error post insert", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func Show(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	post, ok := ctx.Value("post").(models.Post)
	if !ok {
		http.Error(w, http.StatusText(422), 422)
		return
	}

	postJSON, err := json.Marshal(post)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Écrire la réponse JSON dans la réponse HTTP
	w.Header().Set("Content-Type", "application/json")
	w.Write(postJSON)
	w.WriteHeader(http.StatusOK)
}

func Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	post, ok := ctx.Value("post").(models.Post)
	if !ok {
		http.Error(w, http.StatusText(422), 422)
		return
	}

	// Supprimer le post de la base de données en utilisant l'ID du post
	_, err := models.Database.Exec("DELETE FROM posts WHERE id = ?", post.Id)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Retourner une réponse de succès
	w.WriteHeader(http.StatusOK)
}

func GetPostById(id int) (models.Post, error) {
	var post models.Post
	query := `
		SELECT p.id, p.content, p.created_at,u.id, u.email, u.username, u.profile_picture, c.city, c.lat, c.long 
		FROM posts p INNER JOIN users u 
		ON p.user_id = u.id  INNER JOIN coordinates c 
		ON p.id = c.post_id WHERE p.id = ?
	`
	row := models.Database.QueryRow(query, id)

	err := row.Scan(&post.Id, &post.Content, &post.Created_at, &post.User.Id, &post.User.Email, &post.User.Username, &post.User.ProfilePicture, &post.Coordinates.City, &post.Coordinates.Lat, &post.Coordinates.Long)

	if err != nil {
		return post, err
	}

	comments, err := comments.GetCommentsByPostID(id)

	if err != nil {
		fmt.Println("Controllers > posts ", err)

		return post, err
	}

	post.Comments = comments

	return post, nil
}

func GetAllPosts() (models.Posts, error) {
	var posts []models.Post

	query := `
		SELECT p.id, p.content, p.created_at,u.id, u.email, u.username, u.profile_picture, c.city, c.lat, c.long 
		FROM posts p 
		INNER JOIN users u ON p.user_id = u.id  
		INNER JOIN coordinates c ON p.id = c.post_id 
	`
	rows, err := models.Database.Query(query)
	if err != nil {
		return models.Posts{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.Id, &post.Content, &post.Created_at, &post.User.Id, &post.User.Email, &post.User.Username, &post.User.ProfilePicture, &post.Coordinates.City, &post.Coordinates.Lat, &post.Coordinates.Long)

		if err != nil {
			return models.Posts{}, err
		}

		// Utiliser GetPostById pour récupérer les détails supplémentaires du poste
		detailedPost, err := GetPostById(post.Id)
		if err != nil {
			return models.Posts{}, err
		}

		// Mettre à jour les détails du poste avec ceux obtenus de GetPostById
		post = detailedPost

		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return models.Posts{}, err
	}

	return models.Posts{Posts: posts}, nil
}
