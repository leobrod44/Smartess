package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"log"

	"github.com/bluenviron/gortsplib/v4"
	"github.com/bluenviron/gortsplib/v4/pkg/base"
	"github.com/bluenviron/gortsplib/v4/pkg/description"
	"github.com/bluenviron/gortsplib/v4/pkg/format"
	"github.com/pion/rtcp"
	"github.com/pion/rtp"
)

type RtspProcessor struct {
	instance *common_rabbitmq.RabbitMQInstance
	client   *gortsplib.Client
	streams  []base.URL
	Logger   *logs.Logger
}

func Init(instance *common_rabbitmq.RabbitMQInstance, logger *logs.Logger) (RtspProcessor, error) {
	c := gortsplib.Client{}

	urls := []string{
		"rtsp://tapoadmin:tapoadmin@192.168.0.19:554/stream1",
	}

	var baseUrls []base.URL
	for _, url := range urls {
		baseUrl, err := base.ParseURL(url)
		if err != nil {
			log.Fatalf("Error parsing URL: %v", err)
		}
		baseUrls = append(baseUrls, *baseUrl)
	}
	return RtspProcessor{
		instance: instance,
		client:   &c,
		streams:  baseUrls,
		Logger:   logger,
	}, nil
}

func (rtsp *RtspProcessor) Start() {

	for _, stream := range rtsp.streams {

		// Connect to the RTSP server
		err := rtsp.client.Start(stream.Scheme, stream.Host)
		if err != nil {
			log.Fatalf("Error connecting to RTSP server: %v", err)
		}

		// Describe the available medias
		desc, _, err := rtsp.client.Describe(&stream)
		if err != nil {
			log.Fatalf("Error describing media: %v", err)
		}

		// Set up all medias
		err = rtsp.client.SetupAll(desc.BaseURL, desc.Medias)
		if err != nil {
			log.Fatalf("Error setting up media: %v", err)
		}

		rtsp.client.OnPacketRTPAny(func(medi *description.Media, forma format.Format, pkt *rtp.Packet) {
			log.Printf("RTP packet from media %v\n", medi)
		})

		// Handle RTCP packet arrival
		rtsp.client.OnPacketRTCPAny(func(medi *description.Media, pkt rtcp.Packet) {
			log.Printf("RTCP packet received from media %v, type: %T", medi, pkt)
		})

		// Start playback
		_, err = rtsp.client.Play(nil)
		if err != nil {
			log.Fatalf("Error starting playback: %v", err)
		}

		// Wait for the process to complete or until a fatal error occurs
		log.Println("Waiting for the stream to play...")
		err = rtsp.client.Wait()
		if err != nil {
			log.Fatalf("Fatal error: %v", err)
		}

		log.Println("Stream ended or connection closed successfully")
	}

}

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}
