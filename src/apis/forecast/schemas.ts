import { z } from "zod";
import { CURRENT_VARIABLES, DAILY_VARIABLES, HOURLY_VARIABLES } from "./variables";

/**
 * Schema for base forecast parameters
 */
const baseForecastParamsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().optional(),
  temperature_unit: z.enum(["celsius", "fahrenheit"]).optional(),
  wind_speed_unit: z.enum(["kmh", "ms", "mph", "kn"]).optional(),
  precipitation_unit: z.enum(["mm", "inch"]).optional(),
  forecast_days: z.number().int().min(0).max(16).optional(),
  past_days: z.number().int().min(0).max(92).optional(),
});

/**
 * Schema for forecast API parameters
 */
export const forecastParamsSchema = baseForecastParamsSchema.extend({
  hourly: z.array(z.enum(HOURLY_VARIABLES as unknown as [string, ...string[]])).optional(),
  daily: z.array(z.enum(DAILY_VARIABLES as unknown as [string, ...string[]])).optional(),
  current: z.array(z.enum(CURRENT_VARIABLES as unknown as [string, ...string[]])).optional(),
});

/**
 * Schema for hourly data in raw response
 * Explicitly defines all known hourly variables
 */
const rawHourlySchema = z.object({
  time: z.array(z.number()),
  ...Object.fromEntries(HOURLY_VARIABLES.map((variable) => [variable, z.array(z.number()).optional()])),
});

/**
 * Schema for daily data in raw response
 * Explicitly defines all known daily variables
 */
const rawDailySchema = z.object({
  time: z.array(z.number()),
  ...Object.fromEntries(DAILY_VARIABLES.map((variable) => [variable, z.array(z.number()).optional()])),
});

/**
 * Schema for current data in raw response
 * Explicitly defines all known current variables
 */
const rawCurrentSchema = z.object({
  time: z.number(),
  interval: z.number(),
  ...Object.fromEntries(CURRENT_VARIABLES.map((variable) => [variable, z.number().optional()])),
});

/**
 * Schema for raw Open-Meteo API response
 */
export const rawForecastResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  utc_offset_seconds: z.number(),
  generationtime_ms: z.number(),
  hourly: rawHourlySchema.optional(),
  hourly_units: z.record(z.string(), z.string()).optional(),
  daily: rawDailySchema.optional(),
  daily_units: z.record(z.string(), z.string()).optional(),
  current: rawCurrentSchema.optional(),
  current_units: z.record(z.string(), z.string()).optional(),
});

export type ForecastParamsSchema = z.infer<typeof forecastParamsSchema>;
export type RawForecastResponseSchema = z.infer<typeof rawForecastResponseSchema>;
