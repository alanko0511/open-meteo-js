import type { RawForecastResponse } from "./types";

/**
 * Set of field names that contain Unix timestamps (in seconds) and need to be converted to milliseconds
 */
const UNIX_TIMESTAMP_FIELDS = new Set(["sunrise", "sunset"]);

/**
 * Transform raw Open-Meteo response to our preferred format
 * Converts from { time: [], var1: [], var2: [] } to [{ time, var1, var2 }, ...]
 * Also extracts units for requested variables
 */
export function transformForecastResponse(raw: RawForecastResponse) {
  const result: any = {
    latitude: raw.latitude,
    longitude: raw.longitude,
    elevation: raw.elevation,
    timezone: raw.timezone,
    timezone_abbreviation: raw.timezone_abbreviation,
    utc_offset_seconds: raw.utc_offset_seconds,
  };

  // Transform hourly data
  if (raw.hourly) {
    const time = raw.hourly.time;
    if (time && Array.isArray(time)) {
      const length = time.length;
      const hourlyData = new Array(length); // Pre-allocate array
      const variableKeys = Object.keys(raw.hourly).filter((k) => k !== "time");
      const variableCount = variableKeys.length;

      for (let i = 0; i < length; i++) {
        const dataPoint: any = {
          time: time[i]! * 1000, // Convert Unix timestamp to milliseconds
        };

        // Direct property access instead of Object.entries()
        for (let j = 0; j < variableCount; j++) {
          const key = variableKeys[j]!;
          const values = raw.hourly[key];
          if (Array.isArray(values)) {
            dataPoint[key] = values[i];
          }
        }

        hourlyData[i] = dataPoint;
      }

      result.hourly = hourlyData;
    }

    // Add hourly units
    if (raw.hourly_units) {
      result.hourly_units = raw.hourly_units;
    }
  }

  // Transform daily data
  if (raw.daily) {
    const time = raw.daily.time;
    if (time && Array.isArray(time)) {
      const length = time.length;
      const dailyData = new Array(length); // Pre-allocate array
      const variableKeys = Object.keys(raw.daily).filter((k) => k !== "time");
      const variableCount = variableKeys.length;

      for (let i = 0; i < length; i++) {
        const dataPoint: any = {
          time: time[i]! * 1000, // Convert Unix timestamp to milliseconds
        };

        // Direct property access instead of Object.entries()
        for (let j = 0; j < variableCount; j++) {
          const key = variableKeys[j]!;
          const values = raw.daily[key];
          if (Array.isArray(values)) {
            const value = values[i];
            // Convert Unix timestamp fields to milliseconds
            if (UNIX_TIMESTAMP_FIELDS.has(key) && typeof value === "number") {
              dataPoint[key] = value * 1000;
            } else {
              dataPoint[key] = value;
            }
          }
        }

        dailyData[i] = dataPoint;
      }

      result.daily = dailyData;
    }

    // Add daily units
    if (raw.daily_units) {
      result.daily_units = raw.daily_units;
    }
  }

  // Transform current data
  if (raw.current) {
    const { time, interval, ...variables } = raw.current;
    const currentData: any = {
      time: time * 1000, // Convert Unix timestamp to milliseconds
    };

    // Add each variable value
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "number") {
        currentData[key] = value;
      }
    }

    result.current = currentData;

    // Add current units
    if (raw.current_units) {
      result.current_units = raw.current_units;
    }
  }

  return result;
}
