/**
 * Hourly weather variables supported by the API
 * Based on Open-Meteo Weather Forecast API documentation
 */
export const HOURLY_VARIABLES = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "apparent_temperature",
  "precipitation_probability",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "snow_depth",
  "weather_code",
  "pressure_msl",
  "surface_pressure",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "visibility",
  "evapotranspiration",
  "et0_fao_evapotranspiration",
  "vapour_pressure_deficit",
  "wind_speed_10m",
  "wind_speed_80m",
  "wind_speed_120m",
  "wind_speed_180m",
  "wind_direction_10m",
  "wind_direction_80m",
  "wind_direction_120m",
  "wind_direction_180m",
  "wind_gusts_10m",
  "temperature_80m",
  "temperature_120m",
  "temperature_180m",
  "soil_temperature_0cm",
  "soil_temperature_6cm",
  "soil_temperature_18cm",
  "soil_temperature_54cm",
  "soil_moisture_0_1cm",
  "soil_moisture_1_3cm",
  "soil_moisture_3_9cm",
  "soil_moisture_9_27cm",
  "soil_moisture_27_81cm",
] as const;

/**
 * Daily weather variables supported by the API
 */
export const DAILY_VARIABLES = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "sunrise",
  "sunset",
  "daylight_duration",
  "sunshine_duration",
  "uv_index_max",
  "uv_index_clear_sky_max",
  "rain_sum",
  "showers_sum",
  "snowfall_sum",
  "precipitation_sum",
  "precipitation_hours",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "shortwave_radiation_sum",
  "et0_fao_evapotranspiration",
] as const;

/**
 * Current weather variables supported by the API
 */
export const CURRENT_VARIABLES = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "surface_pressure",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
] as const;

export type HourlyVariable = (typeof HOURLY_VARIABLES)[number];
export type DailyVariable = (typeof DAILY_VARIABLES)[number];
export type CurrentVariable = (typeof CURRENT_VARIABLES)[number];

