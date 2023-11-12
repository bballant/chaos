#!/usr/bin/env tsx

import { fetchWeatherApi } from 'openmeteo';
	

export type WeatherData = {
	time: Date,
	temperature: number,
	humidity: number,
	precipitation: number,
	windSpeed: number,
}

export async function currentWeatherInMaplewood(): Promise<WeatherData> {
	const params = {
		"latitude": 52.52,
		"longitude": 13.41,
		"current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"],
		"temperature_unit": "fahrenheit",
		"wind_speed_unit": "mph",
		"precipitation_unit": "inch"
	};
	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params);

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

	// Note: The order of weather variables in the URL query and the indices below need to match!
	return {
		time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
		temperature: current.variables(0)!.value(),
		humidity: current.variables(1)!.value(),
		precipitation: current.variables(2)!.value(),
		windSpeed: current.variables(3)!.value(),
	};
}

export async function printCurrentWeatherInMaplewood() {
	const currentWeather = await currentWeatherInMaplewood();
	console.log(currentWeather);
}