package categories

import (
	"encoding/json"
	"fmt"
	comments "main/Controllers/Comments"
	models "main/Models"
	"net/http"
	"strings"
)

func Create(w http.ResponseWriter, r *http.Request) {
	var caterogy models.Caterogy
	err := json.NewDecoder(r.Body).Decode(&caterogy)
	if err != nil {
		http.Error(w, "Invalid request payload post", http.StatusBadRequest)
		return
	}

	title := strings.Title(strings.ToLower(caterogy.Title))

	resp, err := models.Database.Exec("INSERT INTO categories (title) VALUES (?)", title)
	if err != nil {
		http.Error(w, "Database insert error post insert", http.StatusInternalServerError)
		return
	}

	id, _ := resp.LastInsertId()

	cateJSON, err := json.Marshal(map[string]int64{"id": id})
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Écrire la réponse JSON dans la réponse HTTP
	w.Header().Set("Content-Type", "application/json")
	w.Write(cateJSON)
	w.WriteHeader(http.StatusOK)
}

func Index(w http.ResponseWriter, r *http.Request) {
	cate, err := GetAllCategories()
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cate)
}

func GetAllCategories() ([]models.Caterogy, error) {
	var categories []models.Caterogy

	query := `SELECT * FROM categories`
	rows, err := models.Database.Query(query)
	if err != nil {
		return []models.Caterogy{}, err
	}

	for rows.Next() {
		var caterogy models.Caterogy
		err := rows.Scan(&caterogy.Id, &caterogy.Title)

		if err != nil {
			return []models.Caterogy{}, err
		}
		caterogy.Posts, _ = GetPostsByCategory(caterogy.Id)

		categories = append(categories, caterogy)
	}

	return categories, nil
}

func Link(post models.Post) error {
	for _, categorie := range post.Categories {
		_, err := models.Database.Exec("INSERT INTO categories_post (post_id, categorie_id) VALUES (?, ?)", post.Id, categorie.Id)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetCategoriesByPostID(postID int) ([]models.Caterogy, error) {
	var categories []models.Caterogy

	query := `
		SELECT c.id, c.title
		FROM categories c
		INNER JOIN categories_post cp ON c.id = cp.categorie_id
		WHERE cp.post_id = ?
	`

	rows, err := models.Database.Query(query, postID)
	if err != nil {
		return []models.Caterogy{}, err
	}

	for rows.Next() {
		var category models.Caterogy
		err := rows.Scan(&category.Id, &category.Title)

		if err != nil {
			return []models.Caterogy{}, err
		}

		categories = append(categories, category)
	}
	return categories, nil
}

func GetPostsByCategory(categoryID int) ([]models.Post, error) {
	var posts []models.Post

	query := `
		SELECT p.id, p.title, p.content, p.created_at, u.id, u.email, u.username, u.profile_picture, c.city, c.lat, c.long
		FROM posts p
		INNER JOIN users u ON p.user_id = u.id
		INNER JOIN coordinates c ON p.id = c.post_id
		INNER JOIN categories_post cp ON p.id = cp.post_id
		WHERE cp.categorie_id = ?
	`

	rows, err := models.Database.Query(query, categoryID)
	if err != nil {
		return []models.Post{}, err
	}

	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.Id, &post.Title, &post.Content, &post.Created_at, &post.User.Id, &post.User.Email, &post.User.Username, &post.User.ProfilePicture, &post.Coordinates.City, &post.Coordinates.Lat, &post.Coordinates.Long)

		if err != nil {
			return []models.Post{}, err
		}

		comments, err := comments.GetCommentsByPostID(post.Id)
		if err != nil {
			fmt.Println("Controllers > posts ", err)
			return []models.Post{}, err
		}
		post.Comments = comments

		posts = append(posts, post)
	}

	return posts, nil
}
