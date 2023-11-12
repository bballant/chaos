import wifi
import socketpool
import ssl
import time
import board
import microcontroller
import adafruit_bme280.advanced as adafruit_bme280
import adafruit_minimqtt.adafruit_minimqtt as MQTT
from adafruit_io.adafruit_io import IO_MQTT

# Connect to wifi
print("Connecting to wifi")
wifi.radio.connect("ssid", "pass")
pool = socketpool.SocketPool(wifi.radio)

def connected(client):
    print("I have connected")

mqtt_client = MQTT.MQTT(
    broker="192.168.1.160",
    socket_pool=pool,
    ssl_context=ssl.create_default_context(),
)

# Initialize Adafruit IO MQTT "helper"
# Not using Adafruit IO, but I didn't see another way
io = IO_MQTT(mqtt_client)

# Set up the callback methods above
io.on_connect = connected

# Create sensor object, using the board's default I2C bus.
i2c = board.I2C()  # uses board.SCL and board.SDA
# i2c = board.STEMMA_I2C()  # For using the built-in STEMMA QT connector on a microcontroller
bme280 = adafruit_bme280.Adafruit_BME280_I2C(i2c)

# Change this to match the location's pressure (hPa) at sea level
bme280.sea_level_pressure = 1013.25
bme280.mode = adafruit_bme280.MODE_NORMAL
bme280.standby_period = adafruit_bme280.STANDBY_TC_500
bme280.iir_filter = adafruit_bme280.IIR_FILTER_X16
bme280.overscan_pressure = adafruit_bme280.OVERSCAN_X16
bme280.overscan_humidity = adafruit_bme280.OVERSCAN_X1
bme280.overscan_temperature = adafruit_bme280.OVERSCAN_X2
# The sensor will need a moment to gather initial readings
time.sleep(1)

while True:
    try:
        if not io.is_connected:
            print("Connecting  to mqtt broker")
            io.connect()
        
        io.loop()

        mqtt_client.publish("/a/temperature", "%0.1f" % bme280.temperature)
        mqtt_client.publish("/a/humidity", "%0.1f" % bme280.relative_humidity)
        print("\nTemperature: %0.1f C" % bme280.temperature)
        print("Temperature: %0.1f F" % ((bme280.temperature * 9 / 5) + 32))
        print("Humidity: %0.1f %%" % bme280.relative_humidity)
        print("Pressure: %0.1f hPa" % bme280.pressure)
        print("Altitude = %0.2f meters" % bme280.altitude)
        time.sleep(10)
    except Exception as e:
        print("Failed to get or send data, or connect. Error:", e,
        "\nBoard will hard reset in 30 seconds.")
        time.sleep(30) 
        microcontroller.reset()
