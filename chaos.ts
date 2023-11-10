#!/usr/bin/env tsx

import * as app from "./app/app";

function printUsage() {
  console.log(`Usage:
  ./chaos
  `);
}

function main() {
  if (process.argv.length < 3) {
    printUsage();
    return;
  }

  switch (process.argv[2]) {
    case "mqtt-subscriber":
      if (!process.argv[3]) {
        printUsage();
        return;
      }
      const topic = process.argv[3]
      app.mqttSubscriber(topic);
      return;
    case "test-client":
      app.testClient();
      return;
    case "run-server":
      app.runServer();
      return;
    case "cool":
      app.printSomethingCool();
      console.log("cool");
      return;
    default:
      printUsage()
      return;
  }
}

main();