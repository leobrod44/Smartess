"use client";

import React, { useEffect } from "react";
import LandingNavbar from "@/app/components/LandingNavbar";

import { Client, Frame, Message } from "@stomp/stompjs";

const AboutPage: React.FC = () => {
    useEffect(() => {
        const brokerURL = "ws://localhost:15674/ws";
        const login = "admin";
        const passcode = "admin";

        // Create the STOMP client
        const client: Client = new Client({
            brokerURL,
            connectHeaders: {
                login,
                passcode,
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: (frame: Frame) => {
                console.log("Connected to RabbitMQ Web STOMP:", frame);

                client.subscribe("/queue/website.alert", (message: Message) => {
                    if (message.body) {
                        console.log("Message received:", message.body);
                    }
                });
            },
            onStompError: (frame: Frame) => {
                console.error("STOMP connection error:", frame);
            }
        });

        // Connect to the broker
        client.activate();

        return () => {
            // Cleanup on unmount
            if (client.connected) {
                client.deactivate();
                console.log("Disconnected from RabbitMQ");
            }
        };
    }, []);

    return (
        <div>
            <LandingNavbar />
            <h1>About</h1>
            <p>Listening to RabbitMQ Messages...</p>
        </div>
    );
};

export default AboutPage;
