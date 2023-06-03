package main

import (
	"encoding/json"
	"fmt"
	"main/database"
)

func main() {
	database.Initialize(false)

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
