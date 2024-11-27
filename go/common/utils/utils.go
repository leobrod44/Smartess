package utils

import (
	"encoding/json"
	"fmt"
)

// Parses simply a raw JSON string into a generic T type struct (Warning: generic T requires newer go version, else interface{})
func ParseJsonBasic[T any](rawJSON string) (*T, error) {
	var result T
	err := json.Unmarshal([]byte(rawJSON), &result)
	if err != nil {
		return nil, fmt.Errorf("error parsing JSON: %v", err)
	}
	return &result, nil
}

// Fetches a string pointer from a map of fields, if the key exists and the value is a string else nil
func GetStringPtrNilSafe(fields map[string]interface{}, key string) *string {
	if value, ok := fields[key].(string); ok {
		return &value
	}
	return nil
}
