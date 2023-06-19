package posts

import (
	"encoding/json"
	"fmt"
	categories "main/Controllers/Categories"
	comments "main/Controllers/Comments"
	models "main/Models"
	"net"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
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
	fmt.Println(post.Title, post.Content, models.ThisUser.Id)

	res, err := models.Database.Exec("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", post.Title, post.Content, models.ThisUser.Id)
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

	post.Id = int(lastId)

	err = categories.Link(post)
	if err != nil {
		http.Error(w, "Database insert error categories insert", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"post_id": lastId,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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
		SELECT p.id, p.title, p.content, p.created_at,u.id, u.email, u.username, u.profile_picture, c.city, c.lat, c.long
		FROM posts p 
		INNER JOIN users u  ON p.user_id = u.id 
		INNER JOIN coordinates c ON p.id = c.post_id WHERE p.id = ?
	`
	row := models.Database.QueryRow(query, id)

	err := row.Scan(&post.Id, &post.Title, &post.Content, &post.Created_at, &post.User.Id, &post.User.Email, &post.User.Username, &post.User.ProfilePicture, &post.Coordinates.City, &post.Coordinates.Lat, &post.Coordinates.Long)

	if err != nil {
		return post, err
	}

	// Vérifier si la vue existe déjà
	var count int = 0
	_ = models.Database.QueryRow("SELECT COUNT(*) FROM views WHERE post_id = ?", post.Id).Scan(&count)

	post.Views = count

	comments, err := comments.GetCommentsByPostID(id)

	if err != nil {
		fmt.Println("Controllers > posts ", err)

		return post, err
	}

	post.Comments = comments

	// Récupérer les catégories du post
	categories, err := categories.GetCategoriesByPostID(id)

	if err != nil {
		fmt.Println("Controllers > posts ", err)

		return post, err
	}

	post.Categories = categories

	return post, nil
}

func GetAllPosts() (models.Posts, error) {
	var posts []models.Post

	query := `
		SELECT p.id, p.title, p.content, p.created_at,u.id, u.email, u.username, u.profile_picture, c.city, c.lat, c.long 
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
		err := rows.Scan(&post.Id, &post.Title, &post.Content, &post.Created_at, &post.User.Id, &post.User.Email, &post.User.Username, &post.User.ProfilePicture, &post.Coordinates.City, &post.Coordinates.Lat, &post.Coordinates.Long)

		if err != nil {
			return models.Posts{}, err
		}

		// Vérifier si la vue existe déjà
		var count int = 0
		_ = models.Database.QueryRow("SELECT COUNT(*) FROM views WHERE post_id = ?", post.Id).Scan(&count)

		post.Views = count

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

func View(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "postId")
	id, _ := strconv.Atoi(postID)

	ip, _, _ := net.SplitHostPort(r.RemoteAddr)

	// Vérifier si la vue existe déjà
	var count int
	err := models.Database.QueryRow("SELECT COUNT(*) FROM views WHERE post_id = ? AND ip = ?", id, ip).Scan(&count)
	if err != nil {
		http.Error(w, "Database select error", http.StatusInternalServerError)
		return
	}

	// Si la vue existe déjà, ne rien faire
	if count > 0 {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Insérer la vue dans la base de données
	_, err = models.Database.Exec("INSERT INTO views (post_id, ip) VALUES (?, ?)", id, ip)
	if err != nil {
		http.Error(w, "Database insert error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
