package ha

import "Smartess/go/common/structures"

type WebhookMessage struct {
	ID    int                     `json:"id"`
	Type  string                  `json:"type"`
	Event structures.EventDetails `json:"event"`
}
