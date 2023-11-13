#!/usr/bin/env tsx

import * as app from "./app/app";

function printUsage() {
  console.log(`Usage:
  Chaos homeskillet tools

  # default  usage depends on tsx
  npm install tsx --global

  # install local npm deps
  npm install

  # run the tsx script
  ./chaos.ts <subcommand> [host-url] [*topic]

  subcommands:
    mqtt-weather-event
    mqtt-logger
    mqtt-logger-reset-db
    mqtt-subscriber
  `);
}

function main() {
  if (process.argv.length < 3) {
    printUsage();
    return;
  }

  switch (process.argv[2]) {
    // Weather Event
    case "mqtt-weather-event":
      app.mqttWeatherEvent(
        process.argv[3] ? process.argv[3] : "mqtt://0.0.0.0"
      );
      return;
    // Event Logger
    case "mqtt-logger":
      app.mqttLogger(
        process.argv[3] ? process.argv[3] : "mqtt://0.0.0.0"
      );
      return;
    // Event Logger DB Reset - Deletes all records
    case "mqtt-logger-reset-db":
      app.mqttLoggerResetDB();
      return;
    // Event Printer
    case "mqtt-subscriber":
      const hostUrl = process.argv[3] ? process.argv[3] : "mqtt://0.0.0.0"
      const topic = process.argv[4] ? process.argv[4] : "#"
      app.mqttSubscriber(topic, hostUrl);
      return;
    default:
      printUsage()
      return;
  }
}

main();
