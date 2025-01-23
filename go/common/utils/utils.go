package utils

import (
	"Smartess/go/common/structures"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"regexp"
	"strings"
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
func NormalizeStringToTag(rawTag string) string {
	normalized := strings.ToLower(strings.ReplaceAll(rawTag, " ", "_"))
	reg := regexp.MustCompile(`[^a-z0-9_]+`)
	return reg.ReplaceAllString(normalized, "")
}

// Generic function to make API calls and unmarshal the response into a given structure type
func GetDataFromAPIendpoint(fullApiUrl, token string, result interface{}) error {

	req, err := http.NewRequest("GET", fullApiUrl, nil)
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	// Set the Authorization header for JWT-like or long-lived tokens
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error making HTTP request: %v", err)
	}
	//nolint:errcheck
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error: expected 200 OK, got %v", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading response body: %v", err)
	}
	if err := json.Unmarshal(body, result); err != nil {
		if err := json.NewDecoder(resp.Body).Decode(result); err != nil {
			return fmt.Errorf("error unmarshaling / decoding response: %v", err)
		}
	}

	return nil
}

// TODO WILL CHANGE AND WORK ON THESE MORE, NEED TO DETERMINE THE TYPE OF ALERT
var alertMappings = map[string]string{
	"light":   structures.AlertTypeLight,
	"sensor":  structures.AlertTypeSensor,
	"climate": structures.AlertTypeClimate,
}

// TODO WILL CHANGE AND WORK ON THESE MORE, NEED TO DETERMINE THE TYPE OF ALERT
func DetermineAlertType(entityID string) string {
	for prefix, alertType := range alertMappings {
		if strings.HasPrefix(entityID, prefix) {
			return alertType
		}
	}

	return structures.AlertTypeUnknown
}

func IsStructEmpty(s interface{}) bool {
	v := reflect.ValueOf(s)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return true
		}
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		panic("IsStructEmpty: input is not a struct or pointer to a struct")
	}

	for i := 0; i < v.NumField(); i++ {
		if !reflect.DeepEqual(v.Field(i).Interface(), reflect.Zero(v.Field(i).Type()).Interface()) {
			return false
		}
	}

	return true
}
