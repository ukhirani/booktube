package main

import (
	"fmt"
	"net/http"
)

const Port = ":8080"

func server(w http.ResponseWriter, r *http.Request) {
	_, err := fmt.Fprintf(w, "Server started . . . . ")
	if err != nil {
		fmt.Println(err)
	}
}

func main() {
	fmt.Println("Starting server on", Port)
	http.HandleFunc("/", server)
	http.ListenAndServe(Port, nil)
}
