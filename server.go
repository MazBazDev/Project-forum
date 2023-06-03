package main

import (
	"encoding/json"
	"fmt"
	"main/database"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

func main() {
	database.Initialize(false)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})
	http.ListenAndServe(":3000", r)
}

func returnError(inCode int, inMessage string) string {
	type errorData struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	}

	reDatas, err := json.Marshal(errorData{
		Code:    inCode,
		Message: inMessage,
	})

	if err != nil {
		fmt.Println(err)
	}
	return string(reDatas)
}
