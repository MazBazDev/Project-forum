package localisations

import (
	"encoding/json"
	"log"
	models "main/Models"
	"net/http"
	"strconv"
)

func Index(w http.ResponseWriter, r *http.Request) {
	locations, err := getAllLocations()
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

func getAllLocations() ([]models.Coordinates, error) {
	// Query to fetch all coordinates
	query := `
		SELECT id, city, lat, long
		FROM coordinates
	`

	// Execute the query
	rows, err := models.Database.Query(query)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer rows.Close()

	// Map to store the merged locations
	locations := make(map[string]models.Coordinates)

	// Iterate through the result rows
	for rows.Next() {
		var id string
		var city string
		var lat float64
		var long float64

		// Scan the values from the current row
		err := rows.Scan(&id, &city, &lat, &long)
		if err != nil {
			log.Fatal(err)
			return nil, err
		}

		// Check if the city already exists in the map
		if coord, ok := locations[city]; ok {
			// City already exists, add the post to existing coordinates
			pid, _ := strconv.Atoi(id)
			post := models.Post{Id: pid}
			coord.Posts = append(coord.Posts, post)
			locations[city] = coord
		} else {
			// City doesn't exist, create new coordinates entry
			pid, _ := strconv.Atoi(id)

			coord := models.Coordinates{
				Id:    id,
				City:  city,
				Lat:   lat,
				Long:  long,
				Posts: []models.Post{{Id: pid}},
			}
			locations[city] = coord
		}
	}

	// Check for any errors during iteration
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	// Convert the map of locations to a slice
	uniqueLocations := make([]models.Coordinates, 0, len(locations))
	for _, location := range locations {
		uniqueLocations = append(uniqueLocations, location)
	}

	return uniqueLocations, nil
}
