import * as mqtt from 'mqtt';
import * as weather from './weather';
import * as db from './db';
import Database from 'better-sqlite3';

export function mkMqttClient(hostUrl: string): mqtt.MqttClient {
    const client = mqtt.connect(hostUrl);
    client.on("error", function (error) {
        console.log(error)
    });
    client.on("disconnect", () => {
        console.log("Disconnection");
        client.end();
    });
    return client;
}

export function mqttSubscriber(topic: string, hostUrl: string) {
    const client = mqtt.connect(hostUrl);
    client.on('error', function (error) {
        console.log(error)
    });
    client.on("connect", () => {
        client.subscribe(topic, (err) => {
            if (err) {
                console.log("Error connecting", err);
            } else {
                console.log("connected");
            }
        });
    });
    client.on("message", (msgTopic, message) => {
        console.log(`${msgTopic} ${message.toString()}`);
    });
    client.on("disconnect", () => {
        console.log("Disconnection");
        client.end();
    });
}

export function mqttWeatherEvent(mqttUrl: string) {
    const client = mkMqttClient(mqttUrl);
    client.on("connect", () => {
        console.log("MQTT client connected");
        weather.publishCurrentWeatherInMaplewood(client).then((_) => {
            client.end(false, () => {
                console.log("MQTT client disconnected");
            })
        });
    });
}

function mkDatabase(): Database.Database {
    const database = new Database('db/chaos.db', { verbose: console.log });
    database.pragma('journal_mode = WAL');
    return database;
}

export function mqttLogger(hostUrl: string) {
    const client = mkMqttClient(hostUrl);
    const database = mkDatabase();
    client.on("connect", () => {
        // subscribe to all events
        client.subscribe('#', (err) => {
            if (err) {
                console.log("Error connecting", err);
            } else {
                console.log("connected");
            }
        });
    });

    client.on("message", (msgTopic, message) => {
        console.log(`${msgTopic} ${message.toString()}`);
        db.insertEvent(database, {
            created_at: String(new Date()),
            topic: msgTopic,
            value: message.toString(),
        })
    });
}

export function mqttLoggerResetDB() {
    const database = mkDatabase();
    db.resetDB(database);
}
