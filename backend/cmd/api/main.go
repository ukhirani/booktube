package main

import (
	"fmt"
	"net/http"
)

const Port = ":8080"

func server(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Server started . . . . ")
}

func main() {
	fmt.Println("Starting server on", Port)
	http.HandleFunc("/", server)
	http.ListenAndServe(Port, nil)
}
