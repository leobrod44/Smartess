package hub

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	structures "Smartess/go/common/structures"
	"Smartess/go/hub/events"
	logs "Smartess/go/hub/logger"
	"Smartess/go/hub/rtsp"
	"errors"
	"fmt"
	"sync"
)

type SmartessHub struct {
	instance       *common_rabbitmq.RabbitMQInstance
	event_handler  *events.EventHandler
	rtsp_processor *rtsp.RtspProcessor
	Logger         *logs.Logger
}

func Init(selectedHub structures.HubTypeEnum) (SmartessHub, error) {
	logger, err := logs.NewRabbitMQLogger()
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ logger: " + err.Error())
	}

	instance, err := common_rabbitmq.Init("/app/config/config.yaml")
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}
	event_handler, err := events.Init(selectedHub, logger, instance)
	logger.Info("Event Handler initialized")
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize EventHandler: " + err.Error())
	}

	// Declare the topic exchange
	err = instance.Channel.ExchangeDeclare(
		common_rabbitmq.Test0AlertRoutingKey, // name of the exchange
		"topic",                              // type of exchange
		true,                                 // durable
		false,                                // auto-deleted
		false,                                // internal
		false,                                // no-wait
		nil,
	)
	if err != nil {
		return SmartessHub{}, fmt.Errorf("Failed to declare alert topic exchange: %v", err)
	}
	err = instance.Channel.ExchangeDeclare(
		common_rabbitmq.Test0VideoStreamingRoutingKey, // name of the exchange
		"direct", // type of exchange
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	if err != nil {
		return SmartessHub{}, fmt.Errorf("Failed to declare direct video streaming exchange: %v", err)
	}
	logger.Info("Declared topic exchange")
	rtsp_processor, err := rtsp.Init(instance, logger)
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RTSP Processor: " + err.Error())
	}
	logger.Info("RTSP Processor initialized")

	return SmartessHub{
		instance:       instance,
		event_handler:  &event_handler,
		rtsp_processor: &rtsp_processor,
		Logger:         logger,
	}, nil
}

func (hub *SmartessHub) Start(selectedHub structures.HubTypeEnum) {
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done() // Decrement the counter when this goroutine completes
		hub.event_handler.Start(selectedHub, hub.instance.Config.Exchanges)
	}()
	go func() {
		defer wg.Done() // Decrement the counter when this goroutine completes
		hub.rtsp_processor.Start()
	}()
	wg.Wait()
	hub.rtsp_processor.Close()
	hub.event_handler.Close()
}
