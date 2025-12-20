import { describe, expect, it } from "bun:test";
import { HTTPError } from "ky";
import { forecastAPI } from "../apis/forecast";
import { CURRENT_VARIABLES, DAILY_VARIABLES, HOURLY_VARIABLES } from "../apis/forecast/variables";

describe("forecast api", () => {
  it("should provide response type based on the requested parameters", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m", "cloud_cover", "wind_speed_10m"],
      daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
      current: ["temperature_2m", "weather_code"],
    });

    expect(response.hourly).toBeDefined();
    expect(response.hourly.length).toBeGreaterThan(0);

    const firstHourly = response.hourly[0]!;
    expect(typeof firstHourly.time).toBe("number");
    expect(typeof firstHourly.temperature_2m).toBe("number");
    expect(typeof firstHourly.cloud_cover).toBe("number");
    expect(typeof firstHourly.wind_speed_10m).toBe("number");

    expect({
      temperature_2m: typeof firstHourly.temperature_2m,
      cloud_cover: typeof firstHourly.cloud_cover,
      wind_speed_10m: typeof firstHourly.wind_speed_10m,
      keys: Object.keys(firstHourly).sort(),
    }).toMatchSnapshot();

    expect(response.hourly_units).toBeDefined();
    expect(typeof response.hourly_units.temperature_2m).toBe("string");
    expect(typeof response.hourly_units.cloud_cover).toBe("string");
    expect(typeof response.hourly_units.wind_speed_10m).toBe("string");
    expect(response.hourly_units).toMatchSnapshot();

    expect(response.daily).toBeDefined();
    expect(response.daily.length).toBeGreaterThan(0);

    const firstDaily = response.daily[0]!;
    expect(typeof firstDaily.time).toBe("number");
    expect(typeof firstDaily.temperature_2m_max).toBe("number");
    expect(typeof firstDaily.temperature_2m_min).toBe("number");
    expect(typeof firstDaily.precipitation_sum).toBe("number");

    expect({
      temperature_2m_max: typeof firstDaily.temperature_2m_max,
      temperature_2m_min: typeof firstDaily.temperature_2m_min,
      precipitation_sum: typeof firstDaily.precipitation_sum,
      keys: Object.keys(firstDaily).sort(),
    }).toMatchSnapshot();

    expect(response.daily_units).toBeDefined();
    expect(typeof response.daily_units.temperature_2m_max).toBe("string");
    expect(typeof response.daily_units.temperature_2m_min).toBe("string");
    expect(typeof response.daily_units.precipitation_sum).toBe("string");
    expect(response.daily_units).toMatchSnapshot();

    expect(response.current).toBeDefined();
    expect(typeof response.current.time).toBe("number");
    expect(typeof response.current.temperature_2m).toBe("number");
    expect(typeof response.current.weather_code).toBe("number");

    const currentSnapshot = {
      temperature_2m: typeof response.current.temperature_2m,
      weather_code: typeof response.current.weather_code,
      keys: Object.keys(response.current).sort(),
    };
    expect(currentSnapshot).toMatchSnapshot();

    expect(response.current_units).toBeDefined();
    expect(typeof response.current_units.temperature_2m).toBe("string");
    expect(typeof response.current_units.weather_code).toBe("string");
    expect(response.current_units).toMatchSnapshot();
  });

  it("should work with only hourly variables", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m", "precipitation"],
    });

    expect(response.hourly).toBeDefined();
    expect(response.hourly.length).toBeGreaterThan(0);
    expect(response.hourly_units).toBeDefined();
    expect(typeof response.hourly_units.temperature_2m).toBe("string");
    expect(typeof response.hourly_units.precipitation).toBe("string");

    expect(Object.keys(response.hourly[0] || {}).sort()).toMatchSnapshot();
    expect(response.hourly_units).toMatchSnapshot();

    expect(response).not.toHaveProperty("daily");
    expect(response).not.toHaveProperty("daily_units");
    expect(response).not.toHaveProperty("current");
    expect(response).not.toHaveProperty("current_units");
  });

  it("should work with only daily variables", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      daily: ["temperature_2m_max", "sunrise", "sunset"],
    });

    expect(response.daily).toBeDefined();
    expect(response.daily.length).toBeGreaterThan(0);

    expect(Object.keys(response.daily[0] || {}).sort()).toMatchSnapshot();
    expect(response.daily_units).toMatchSnapshot();

    expect(response).not.toHaveProperty("hourly");
    expect(response).not.toHaveProperty("hourly_units");
    expect(response).not.toHaveProperty("current");
    expect(response).not.toHaveProperty("current_units");
  });

  it("should work with only current variables", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      current: ["temperature_2m", "wind_speed_10m"],
    });

    expect(response.current).toBeDefined();

    expect(Object.keys(response.current).sort()).toMatchSnapshot();
    expect(response.current_units).toMatchSnapshot();

    expect(response).not.toHaveProperty("hourly");
    expect(response).not.toHaveProperty("hourly_units");
    expect(response).not.toHaveProperty("daily");
    expect(response).not.toHaveProperty("daily_units");
  });

  it("should handle optional parameters", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m"],
      timezone: "America/Toronto",
      temperature_unit: "fahrenheit",
      forecast_days: 3,
    });

    expect(response.timezone).toBe("America/Toronto");
    expect(response.hourly).toBeDefined();
    expect(response.hourly_units.temperature_2m).toBe("°F");
  });

  it("should handle all available variables at once", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: [...HOURLY_VARIABLES],
      daily: [...DAILY_VARIABLES],
      current: [...CURRENT_VARIABLES],
      forecast_days: 1,
    });

    expect(response.hourly).toBeDefined();
    expect(response.daily).toBeDefined();
    expect(response.current).toBeDefined();

    expect(response.hourly.length).toBeGreaterThan(0);
    const firstHourly = response.hourly[0]!;
    expect(typeof firstHourly.time).toBe("number");

    expect(Object.keys(firstHourly).length).toBe(HOURLY_VARIABLES.length + 1);
    expect(Object.keys(firstHourly).sort()).toMatchSnapshot();

    expect(typeof firstHourly.temperature_2m).toBe("number");
    expect(typeof firstHourly.precipitation).toBe("number");
    expect(typeof firstHourly.wind_speed_10m).toBe("number");
    expect(typeof firstHourly.soil_temperature_0cm).toBe("number");

    expect(response.daily.length).toBeGreaterThan(0);
    const firstDaily = response.daily[0]!;
    expect(typeof firstDaily.time).toBe("number");

    expect(Object.keys(firstDaily).length).toBe(DAILY_VARIABLES.length + 1);
    expect(Object.keys(firstDaily).sort()).toMatchSnapshot();

    expect(typeof firstDaily.temperature_2m_max).toBe("number");
    expect(typeof firstDaily.precipitation_sum).toBe("number");
    expect(typeof firstDaily.sunrise).toBe("number");
    expect(typeof firstDaily.wind_speed_10m_max).toBe("number");

    expect(typeof response.current.time).toBe("number");

    expect(Object.keys(response.current).length).toBe(CURRENT_VARIABLES.length + 1);
    expect(Object.keys(response.current).sort()).toMatchSnapshot();

    expect(typeof response.current.temperature_2m).toBe("number");
    expect(typeof response.current.wind_speed_10m).toBe("number");
    expect(typeof response.current.cloud_cover).toBe("number");
    expect(typeof response.current.is_day).toBe("number");

    expect(response.hourly_units).toMatchSnapshot();
    expect(response.daily_units).toMatchSnapshot();
    expect(response.current_units).toMatchSnapshot();
  });

  it("should return time fields as Unix timestamps in milliseconds", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      daily: ["temperature_2m_min"],
      hourly: ["temperature_2m"],
      current: ["temperature_2m"],
    });

    const dailyTime = response.daily[0]!.time;
    expect(typeof dailyTime).toBe("number");
    expect(dailyTime).toBeGreaterThan(0);

    const dailyDate = new Date(dailyTime);
    expect(dailyDate.getTime()).toBe(dailyTime);
    expect(dailyDate.toString()).not.toBe("Invalid Date");
    // Verify timestamp is in milliseconds by checking year (would be ~1970 if not multiplied by 1000)
    expect(dailyDate.getFullYear()).toBeGreaterThanOrEqual(2025);
    expect(dailyDate.getFullYear()).toBeLessThan(2100);

    const hourlyTime = response.hourly[0]!.time;
    expect(typeof hourlyTime).toBe("number");
    expect(hourlyTime).toBeGreaterThan(0);

    const hourlyDate = new Date(hourlyTime);
    expect(hourlyDate.getTime()).toBe(hourlyTime);
    expect(hourlyDate.toString()).not.toBe("Invalid Date");
    expect(hourlyDate.getFullYear()).toBeGreaterThanOrEqual(2025);
    expect(hourlyDate.getFullYear()).toBeLessThan(2100);

    expect(typeof response.current.time).toBe("number");
    expect(response.current.time).toBeGreaterThan(0);

    const currentDate = new Date(response.current.time);
    expect(currentDate.getTime()).toBe(response.current.time);
    expect(currentDate.toString()).not.toBe("Invalid Date");
    expect(currentDate.getFullYear()).toBeGreaterThanOrEqual(2025);
    expect(currentDate.getFullYear()).toBeLessThan(2100);
  });

  it("should return sunrise and sunset fields as Unix timestamps in milliseconds", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      daily: ["sunrise", "sunset", "temperature_2m_max"],
    });

    expect(response.daily).toBeDefined();
    expect(response.daily.length).toBeGreaterThan(0);

    const firstDaily = response.daily[0]!;
    expect(typeof firstDaily.sunrise).toBe("number");
    expect(firstDaily.sunrise).toBeGreaterThan(0);
    expect(typeof firstDaily.sunset).toBe("number");
    expect(firstDaily.sunset).toBeGreaterThan(0);

    const sunriseTime = firstDaily.sunrise;
    const sunriseDate = new Date(sunriseTime);
    expect(sunriseDate.getTime()).toBe(sunriseTime);
    expect(sunriseDate.toString()).not.toBe("Invalid Date");
    expect(sunriseDate.getFullYear()).toBeGreaterThanOrEqual(2025);
    expect(sunriseDate.getFullYear()).toBeLessThan(2100);

    const sunsetTime = firstDaily.sunset;
    const sunsetDate = new Date(sunsetTime);
    expect(sunsetDate.getTime()).toBe(sunsetTime);
    expect(sunsetDate.toString()).not.toBe("Invalid Date");
    expect(sunsetDate.getFullYear()).toBeGreaterThanOrEqual(2025);
    expect(sunsetDate.getFullYear()).toBeLessThan(2100);

    expect(sunsetTime).toBeGreaterThan(sunriseTime);
  });

  it("should include correct unit information", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m", "wind_speed_10m"],
      daily: ["temperature_2m_max"],
      current: ["temperature_2m"],
    });

    expect(typeof response.hourly_units.temperature_2m).toBe("string");
    expect(typeof response.hourly_units.wind_speed_10m).toBe("string");
    expect(typeof response.daily_units.temperature_2m_max).toBe("string");
    expect(typeof response.current_units.temperature_2m).toBe("string");

    expect(response.hourly_units).toMatchSnapshot();
    expect(response.daily_units).toMatchSnapshot();
    expect(response.current_units).toMatchSnapshot();
  });

  it("should have type-safe conditional response properties", async () => {
    const response = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m", "cloud_cover"],
      daily: ["temperature_2m_max"],
    });

    const firstHourly = response.hourly[0]!;
    const firstDaily = response.daily[0]!;
    // These should work because properties were requested
    expect(firstHourly.temperature_2m).toBeDefined();
    expect(firstHourly.cloud_cover).toBeDefined();
    expect(firstDaily.temperature_2m_max).toBeDefined();
    expect(response.hourly_units.temperature_2m).toBeDefined();
    expect(response.hourly_units.cloud_cover).toBeDefined();
    expect(response.daily_units.temperature_2m_max).toBeDefined();

    // These should be TypeScript errors because properties were NOT requested
    // @ts-expect-error - precipitation was not requested
    expect(firstHourly.precipitation).toBeUndefined();
    // @ts-expect-error - wind_speed_10m was not requested
    expect(firstHourly.wind_speed_10m).toBeUndefined();
    // @ts-expect-error - sunrise was not requested
    expect(firstDaily.sunrise).toBeUndefined();
    // @ts-expect-error - precipitation unit was not requested
    expect(response.hourly_units.precipitation).toBeUndefined();

    // These should be TypeScript errors because sections were not requested
    // @ts-expect-error - current was not requested
    expect(response.current).toBeUndefined();
    // @ts-expect-error - current_units was not requested
    expect(response.current_units).toBeUndefined();
  });

  it("should have type-safe response when only requesting one section", async () => {
    const hourlyOnlyResponse = await forecastAPI({
      latitude: 45.4112,
      longitude: -75.6981,
      hourly: ["temperature_2m"],
    });

    // Hourly should exist because it was requested
    expect(hourlyOnlyResponse.hourly).toBeDefined();
    expect(hourlyOnlyResponse.hourly_units).toBeDefined();

    // TypeScript should prevent accessing daily and current because they were not requested
    // @ts-expect-error - daily not requested
    expect(hourlyOnlyResponse.daily).toBeUndefined();
    // @ts-expect-error - daily_units not requested
    expect(hourlyOnlyResponse.daily_units).toBeUndefined();
    // @ts-expect-error - current not requested
    expect(hourlyOnlyResponse.current).toBeUndefined();
    // @ts-expect-error - current_units not requested
    expect(hourlyOnlyResponse.current_units).toBeUndefined();
  });

  it("should fail when using an invalid API key", async () => {
    try {
      await forecastAPI(
        {
          latitude: 45.4112,
          longitude: -75.6981,
          hourly: ["temperature_2m"],
        },
        {
          apiKey: "fake-invalid-api-key-12345",
        }
      );
      // If we get here, the test should fail because the request should have thrown an error
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(HTTPError);

      // We expect the request to fail with a 400 error because the API key is invalid
      const httpError = error as HTTPError;
      expect(httpError.response.status).toBe(400);

      const requestUrl = httpError.request.url;
      expect(requestUrl).toStartWith("https://customer-api.open-meteo.com");
      expect(requestUrl).toContain("apikey=fake-invalid-api-key-12345");

      const responseBody = await httpError.response.json();
      expect(responseBody).toEqual({
        error: true,
        reason: "The supplied API key is invalid.",
      });
    }
  });
});
