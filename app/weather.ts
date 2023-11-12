import { fetchWeatherApi } from 'openmeteo';
import * as mqtt from 'mqtt';

export type WeatherData = {
	time: Date,
	temperature: number,
	humidity: number,
	precipitation: number,
	windSpeed: number,
}

type WeatherEvent<T extends number | string> = {
  topic: string,
  value: T,
}

function currentWeatherInMaplewood(): Promise<WeatherData> {
	const params = {
		"latitude": 52.52,
		"longitude": 13.41,
		"current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"],
		"temperature_unit": "fahrenheit",
		"wind_speed_unit": "mph",
		"precipitation_unit": "inch"
	};
	const url = "https://api.open-meteo.com/v1/forecast";
	
	return fetchWeatherApi(url, params).then((responses) => {
		// Helper function to form time ranges
		const range = (start: number, stop: number, step: number) =>
			Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

		// Process first location. Add a for-loop for multiple locations or weather models
		const response = responses[0];

		// Attributes for timezone and location
		const utcOffsetSeconds = response.utcOffsetSeconds();
		const timezone = response.timezone();
		const timezoneAbbreviation = response.timezoneAbbreviation();
		const latitude = response.latitude();
		const longitude = response.longitude();

		const current = response.current()!;

		const roundy = (x: number) => {return parseFloat(x.toFixed(1))};

		return {
			time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
			temperature: roundy(current.variables(0)!.value()),
			humidity: roundy(current.variables(1)!.value()),
			precipitation: roundy(current.variables(2)!.value()),
			windSpeed: roundy(current.variables(3)!.value()),
		};
	});

}

export function publishCurrentWeatherInMaplewood(client: mqtt.MqttClient): Promise<WeatherData> {
	return currentWeatherInMaplewood().then((currentWeather) => {
		client.publish("maplewood/weather", JSON.stringify(currentWeather));
		return currentWeather;
	});
}

export async function printCurrentWeatherInMaplewood() {
	const currentWeather = await currentWeatherInMaplewood();
	console.log(currentWeather);
}