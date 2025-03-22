## Original Hub for the video streaming feature design and end-to-end dev

This is the original development environment that was used to research, design, test and develop the most networking/theory/arch intensive components of the video streaming feature.\
> First End-to-end working prototype... from RTSP raw stream to final web surveillance page. Development purposes only and not for production.

It is faster to build and deploy in dev/test envs with docker as well as with any deps since it simulates a hub with only smart camera features. \

For the official production camera features as well as other features like alerts/events, logs, etc... of the full project pipeline as seen on website and interfaces,
please refer to prod docker-composes and not this one here which is used for isolated networking / dev purposes.
