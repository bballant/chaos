#!/usr/bin/env tsx

import * as app from "./app/app";
import * as weather from "./app/weather";

function printUsage() {
  console.log(`Usage:
  ./chaos.ts
  `);
}

function main() {
  if (process.argv.length < 3) {
    printUsage();
    return;
  }

  switch (process.argv[2]) {
    case "mqtt-weather-event":
      const weatherUrl = process.argv[3] ? process.argv[3] : "mqtt://0.0.0.0";
      const client = app.mkMqttClient(weatherUrl);
      client.on("connect", () => {
        console.log("MQTT client connected");
        weather.publishCurrentWeatherInMaplewood(client).then((_) => {
          client.end(false, () => {
            console.log("MQTT client disconnected");
          })
        });
      });
      return;
    case "mqtt-subscriber":
      if (!process.argv[3]) {
        printUsage();
        return;
      }
      const hostUrl = process.argv[4] ? process.argv[4] : "mqtt://0.0.0.0"
      const topic = process.argv[3]
      app.mqttSubscriber(topic, hostUrl);
      return;
    case "test-client":
      app.testClient();
      return;
    case "run-server":
      app.runServer();
      return;
    default:
      printUsage()
      return;
  }
}

main();