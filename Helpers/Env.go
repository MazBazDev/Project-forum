package helpers

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if _, err := os.Stat(".env"); err != nil {
		fmt.Println("File .env created successfully !")
		os.Create(".env")
	}

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error while loading .env file", err)
	}
}
