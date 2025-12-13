# @alanko0511/open-meteo-js

[![npm](https://img.shields.io/npm/dm/@alanko0511/open-meteo-js)](https://www.npmjs.com/package/@alanko0511/open-meteo-js)
[![npm](https://img.shields.io/npm/v/@alanko0511/open-meteo-js)](https://www.npmjs.com/package/@alanko0511/open-meteo-js)

A type-safe TypeScript/JavaScript library for the [Open-Meteo Weather API](https://open-meteo.com/). This library uses the JSON API format and transforms the data into an easy-to-use structure (for me at least) with full type safety.

If you need maximum performance, you should check out their [official library](https://www.npmjs.com/package/openmeteo) which uses FlatBuffers. This library is slower because it uses JSON over HTTP with Zod validation, but focuses on developer experience and type safety instead.

## Features

- **Fully Type-Safe**: Response types automatically match your requested variables
- **Runtime Validation**: Zod schemas validate both inputs and outputs
- **Transformed Data**: Converts Open-Meteo's parallel arrays into arrays of objects
- **Timestamps in Milliseconds**: Unix timestamps converted to JavaScript milliseconds (ready for `new Date()`)
- **Type-Safe Units**: Units included for all variables with full type safety

## Installation

```bash
# Using Bun
bun add @alanko0511/open-meteo-js

# Using npm
npm install @alanko0511/open-meteo-js

# Using pnpm
pnpm add @alanko0511/open-meteo-js

# Using Yarn
yarn add @alanko0511/open-meteo-js
```

## Usage

### Basic Example

```typescript
import { forecastAPI } from "@alanko0511/open-meteo-js";

const forecast = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m", "precipitation", "wind_speed_10m"],
  daily: ["temperature_2m_max", "temperature_2m_min"],
  current: ["temperature_2m", "weather_code"],
});

// TypeScript knows the exact structure
console.log(forecast.hourly[0].temperature_2m); // number
console.log(forecast.hourly[0].precipitation); // number
console.log(forecast.daily[0].temperature_2m_max); // number
console.log(forecast.current.weather_code); // number

// Units are also type-safe
console.log(forecast.hourly_units.temperature_2m); // string (e.g., "°C")
console.log(forecast.daily_units.temperature_2m_max); // string

// These would be TypeScript errors:
// console.log(forecast.hourly[0].cloud_cover); // Error: not requested
// console.log(forecast.hourly_units.cloud_cover); // Error: not requested
```

### Data Format

This library transforms the data from parallel arrays to arrays of objects:

**Open-Meteo Format** (parallel arrays):

```typescript
{
  "hourly": {
    "time": [1234567890, 1234571490, ...],
    "temperature_2m": [15.2, 15.5, ...],
    "precipitation": [0, 0.1, ...]
  }
}
```

**This Library** (array of objects):

```typescript
{
  "hourly": [
    {
      "time": 1704067200000, // Unix timestamp in milliseconds
      "temperature_2m": 15.2,
      "precipitation": 0
    },
    {
      "time": 1704070800000, // Unix timestamp in milliseconds
      "temperature_2m": 15.5,
      "precipitation": 0.1
    }
  ],
  "hourly_units": {
    "temperature_2m": "°C",
    "precipitation": "mm"
  }
}
```

**Note:** Time values are Unix timestamps in milliseconds (JavaScript standard). You can easily convert them to Date objects:

```typescript
const date = new Date(forecast.hourly[0].time);
```

### Advanced Options

```typescript
const forecast = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m"],
  timezone: "Europe/Berlin",
  temperature_unit: "fahrenheit",
  wind_speed_unit: "mph",
  precipitation_unit: "inch",
  forecast_days: 7,
  past_days: 1,
});
```

### Commercial API & Self-Hosted Instances

You can use the commercial Open-Meteo API or self-hosted instances by providing configuration options:

#### Commercial API with API Key

When you provide an API key, the library automatically uses the commercial API endpoint (`https://customer-api.open-meteo.com/v1`):

```typescript
const forecast = await forecastAPI(
  {
    latitude: 52.52,
    longitude: 13.41,
    hourly: ["temperature_2m"],
  },
  {
    apiKey: "your-api-key-here",
  }
);
```

#### Self-Hosted Instance

For self-hosted Open-Meteo instances, specify a custom base URL:

```typescript
const forecast = await forecastAPI(
  {
    latitude: 52.52,
    longitude: 13.41,
    hourly: ["temperature_2m"],
  },
  {
    baseUrl: "https://your-domain.com/v1",
  }
);
```

#### Custom Timeout

You can also customize the request timeout (defaults to 30 seconds):

```typescript
const forecast = await forecastAPI(
  {
    latitude: 52.52,
    longitude: 13.41,
    hourly: ["temperature_2m"],
  },
  {
    timeout: 60000, // 60 seconds
  }
);
```

## Available Variables

### Hourly Variables

- `temperature_2m` - Temperature at 2 meters
- `relative_humidity_2m` - Relative humidity at 2 meters
- `dew_point_2m` - Dew point at 2 meters
- `apparent_temperature` - Apparent temperature
- `precipitation_probability` - Precipitation probability
- `precipitation` - Total precipitation (rain + showers + snow)
- `rain` - Rain
- `showers` - Showers
- `snowfall` - Snowfall
- `snow_depth` - Snow depth
- `weather_code` - WMO Weather code
- `pressure_msl` - Sea level pressure
- `surface_pressure` - Surface pressure
- `cloud_cover` - Total cloud cover
- `cloud_cover_low` - Low cloud cover
- `cloud_cover_mid` - Mid cloud cover
- `cloud_cover_high` - High cloud cover
- `visibility` - Visibility
- `evapotranspiration` - Evapotranspiration
- `et0_fao_evapotranspiration` - Reference evapotranspiration
- `vapour_pressure_deficit` - Vapour pressure deficit
- `wind_speed_10m` - Wind speed at 10m
- `wind_speed_80m` - Wind speed at 80m
- `wind_speed_120m` - Wind speed at 120m
- `wind_speed_180m` - Wind speed at 180m
- `wind_direction_10m` - Wind direction at 10m
- `wind_direction_80m` - Wind direction at 80m
- `wind_direction_120m` - Wind direction at 120m
- `wind_direction_180m` - Wind direction at 180m
- `wind_gusts_10m` - Wind gusts at 10m
- `temperature_80m` - Temperature at 80m
- `temperature_120m` - Temperature at 120m
- `temperature_180m` - Temperature at 180m
- `soil_temperature_0cm` - Soil temperature at 0cm
- `soil_temperature_6cm` - Soil temperature at 6cm
- `soil_temperature_18cm` - Soil temperature at 18cm
- `soil_temperature_54cm` - Soil temperature at 54cm
- `soil_moisture_0_1cm` - Soil moisture 0-1cm
- `soil_moisture_1_3cm` - Soil moisture 1-3cm
- `soil_moisture_3_9cm` - Soil moisture 3-9cm
- `soil_moisture_9_27cm` - Soil moisture 9-27cm
- `soil_moisture_27_81cm` - Soil moisture 27-81cm

### Daily Variables

- `weather_code` - WMO Weather code
- `temperature_2m_max` - Maximum temperature
- `temperature_2m_min` - Minimum temperature
- `apparent_temperature_max` - Maximum apparent temperature
- `apparent_temperature_min` - Minimum apparent temperature
- `sunrise` - Sunrise time
- `sunset` - Sunset time
- `daylight_duration` - Daylight duration
- `sunshine_duration` - Sunshine duration
- `uv_index_max` - Maximum UV index
- `uv_index_clear_sky_max` - Maximum UV index (clear sky)
- `rain_sum` - Rain sum
- `showers_sum` - Showers sum
- `snowfall_sum` - Snowfall sum
- `precipitation_sum` - Precipitation sum
- `precipitation_hours` - Precipitation hours
- `precipitation_probability_max` - Maximum precipitation probability
- `wind_speed_10m_max` - Maximum wind speed
- `wind_gusts_10m_max` - Maximum wind gusts
- `wind_direction_10m_dominant` - Dominant wind direction
- `shortwave_radiation_sum` - Shortwave radiation sum
- `et0_fao_evapotranspiration` - Reference evapotranspiration

### Current Variables

- `temperature_2m` - Current temperature
- `relative_humidity_2m` - Current relative humidity
- `apparent_temperature` - Current apparent temperature
- `is_day` - Is it day or night
- `precipitation` - Current precipitation
- `rain` - Current rain
- `showers` - Current showers
- `snowfall` - Current snowfall
- `weather_code` - Current weather code
- `cloud_cover` - Current cloud cover
- `pressure_msl` - Current sea level pressure
- `surface_pressure` - Current surface pressure
- `wind_speed_10m` - Current wind speed
- `wind_direction_10m` - Current wind direction
- `wind_gusts_10m` - Current wind gusts

## Type Safety in Action

The response type adapts based on what variables you request:

```typescript
// Request only temperature
const response1 = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m"],
});
// Works:
//   response1.hourly[0].temperature_2m
//   response1.hourly_units.temperature_2m
// Type errors:
//   response1.hourly[0].precipitation
//   response1.hourly_units.precipitation

// Request temperature and precipitation
const response2 = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m", "precipitation"],
});
// Works:
//   response2.hourly[0].temperature_2m
//   response2.hourly[0].precipitation
//   response2.hourly_units.temperature_2m
//   response2.hourly_units.precipitation

// Request only daily variables
const response3 = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  daily: ["temperature_2m_max"],
});
// Works:
//   response3.daily[0].temperature_2m_max
// Type errors:
//   response3.hourly
//   response3.current
```

### Units

Units are automatically included for all requested variables and are also type-safe:

```typescript
const forecast = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m", "wind_speed_10m"],
  temperature_unit: "fahrenheit",
  wind_speed_unit: "mph",
});

console.log(forecast.hourly_units.temperature_2m); // "°F"
console.log(forecast.hourly_units.wind_speed_10m); // "mph"
// forecast.hourly_units.precipitation // Type error - not requested
```

### Working with Timestamps

All time values are returned as Unix timestamps in milliseconds (JavaScript standard):

```typescript
const forecast = await forecastAPI({
  latitude: 52.52,
  longitude: 13.41,
  hourly: ["temperature_2m"],
});

// Time is a number (milliseconds since Unix epoch)
const timestamp = forecast.hourly[0].time; // e.g., 1704067200000

// Convert to Date when needed
const date = new Date(timestamp);
console.log(date.toISOString()); // "2024-01-01T00:00:00.000Z"

// Or use directly with Date methods
const hours = new Date(forecast.hourly[0].time).getHours();
```

## Error Handling

The library validates both input parameters and API responses using Zod:

```typescript
try {
  const forecast = await forecastAPI({
    latitude: 52.52,
    longitude: 13.41,
    hourly: ["temperature_2m"],
  });
} catch (error) {
  if (error instanceof ZodError) {
    // Validation error (invalid params or unexpected API response)
    console.error("Validation error:", error.issues);
  } else {
    // Network or other errors
    console.error("Request failed:", error);
  }
}
```
