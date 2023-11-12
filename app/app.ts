import * as net from 'net';
import * as mqtt from 'mqtt';

export function runServer() {
  const server = net.createServer((socket) => {
      console.log('Client connected');

      socket.on('data', (data) => {
          const message = data.toString().trim();
          console.log('Received:', message);

          const response = () => {
            switch(message) {
                case 'ping':
                    socket.write('pong');
                    break;
                case 'bud':
                    socket.write('pup');
                    break;
                case 'boo':
                    socket.write('bar');
                    break;
                default:
                    socket.write('Unrecognized command');
            }
          };

          setTimeout(response, 2000);
      });

      socket.on('end', () => {
          console.log('Client disconnected');
      });
  });

  server.listen(8080, () => {
      console.log('Server listening on port 8080');
  });
}

function sendAndReceive(command: string, timeoutMs: number = 2000): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let timeoutHandler: NodeJS.Timeout;

        client.connect(8080, '127.0.0.1', () => {
            console.log('Connected to server');
            client.write(command);
            timeoutHandler = setTimeout(() => {
                client.destroy();
                reject(new Error('Response timed out'));
            }, timeoutMs);
        });

        client.on('data', (data) => {
            clearTimeout(timeoutHandler);
            console.log('Received:', data.toString());
            client.end();
            resolve(data.toString());
        });

        client.on('error', (err) => {
            clearTimeout(timeoutHandler);
            console.error('Error:', err);
            reject(err);
        });

        client.on('close', () => {
            console.log('Connection closed');
        });
    });
}

export async function testClient() {
  const res: string = await sendAndReceive("ping");
  console.log(res);
}

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
