import type { CurrentVariable, DailyVariable, HourlyVariable } from "./variables";

/**
 * Base parameters for the forecast API
 */
export interface BaseForecastParams {
  latitude: number;
  longitude: number;
  timezone?: string;
  temperature_unit?: "celsius" | "fahrenheit";
  wind_speed_unit?: "kmh" | "ms" | "mph" | "kn";
  precipitation_unit?: "mm" | "inch";
  forecast_days?: number;
  past_days?: number;
}

/**
 * Configuration options for the forecast API client
 */
export interface ForecastAPIConfig {
  /**
   * Base URL for the API. Defaults to "https://api.open-meteo.com/v1"
   * Use "https://customer-api.open-meteo.com/v1" for the commercial API
   * or your own URL for self-hosted instances
   */
  baseUrl?: string;
  /**
   * API key for commercial or self-hosted instances
   */
  apiKey?: string;
  /**
   * Request timeout in milliseconds. Defaults to 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * Forecast API parameters with optional variable selections
 */
export interface ForecastParams extends BaseForecastParams {
  hourly?: readonly HourlyVariable[];
  daily?: readonly DailyVariable[];
  current?: readonly CurrentVariable[];
}

/**
 * Helper type to convert a variable array to an object type
 * where each variable is a key with a number value
 */
type VariablesToObject<T extends readonly string[]> = {
  [K in T[number]]: number;
};

/**
 * Helper type for time-based data points
 */
type TimeDataPoint<T extends readonly string[]> = {
  time: number;
} & VariablesToObject<T>;

/**
 * Conditional type for hourly data based on requested variables
 */
type HourlyData<T extends ForecastParams> = T["hourly"] extends readonly HourlyVariable[]
  ? T["hourly"]["length"] extends 0
    ? never
    : TimeDataPoint<T["hourly"]>[]
  : never;

/**
 * Conditional type for daily data based on requested variables
 */
type DailyData<T extends ForecastParams> = T["daily"] extends readonly DailyVariable[]
  ? T["daily"]["length"] extends 0
    ? never
    : TimeDataPoint<T["daily"]>[]
  : never;

/**
 * Conditional type for current data based on requested variables
 */
type CurrentData<T extends ForecastParams> = T["current"] extends readonly CurrentVariable[]
  ? T["current"]["length"] extends 0
    ? never
    : TimeDataPoint<T["current"]>
  : never;

/**
 * Helper type to convert a variable array to a units object type
 * where each variable is a key with a string value (the unit)
 */
type VariablesToUnits<T extends readonly string[]> = {
  [K in T[number]]: string;
};

/**
 * Conditional type for hourly units based on requested variables
 */
type HourlyUnits<T extends ForecastParams> = T["hourly"] extends readonly HourlyVariable[]
  ? T["hourly"]["length"] extends 0
    ? never
    : VariablesToUnits<T["hourly"]>
  : never;

/**
 * Conditional type for daily units based on requested variables
 */
type DailyUnits<T extends ForecastParams> = T["daily"] extends readonly DailyVariable[]
  ? T["daily"]["length"] extends 0
    ? never
    : VariablesToUnits<T["daily"]>
  : never;

/**
 * Conditional type for current units based on requested variables
 */
type CurrentUnits<T extends ForecastParams> = T["current"] extends readonly CurrentVariable[]
  ? T["current"]["length"] extends 0
    ? never
    : VariablesToUnits<T["current"]>
  : never;

/**
 * Response type that adapts based on requested parameters
 */
export type ForecastResponse<T extends ForecastParams> = {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
} & (T["hourly"] extends readonly HourlyVariable[]
  ? T["hourly"]["length"] extends 0
    ? {}
    : { hourly: HourlyData<T>; hourly_units: HourlyUnits<T> }
  : {}) &
  (T["daily"] extends readonly DailyVariable[]
    ? T["daily"]["length"] extends 0
      ? {}
      : { daily: DailyData<T>; daily_units: DailyUnits<T> }
    : {}) &
  (T["current"] extends readonly CurrentVariable[]
    ? T["current"]["length"] extends 0
      ? {}
      : { current: CurrentData<T>; current_units: CurrentUnits<T> }
    : {});

/**
 * Raw response format from Open-Meteo API (before transformation)
 */
export interface RawForecastResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  generationtime_ms: number;
  hourly?: {
    time: number[];
    [key: string]: number[] | number | undefined;
  };
  hourly_units?: Record<string, string>;
  daily?: {
    time: number[];
    [key: string]: number[] | number | undefined;
  };
  daily_units?: Record<string, string>;
  current?: {
    time: number;
    interval: number;
    [key: string]: number | undefined;
  };
  current_units?: Record<string, string>;
}
