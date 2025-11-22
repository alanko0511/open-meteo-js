import ky from "ky";
import { forecastParamsSchema, rawForecastResponseSchema } from "./schemas";
import { transformForecastResponse } from "./transform";
import type { ForecastAPIConfig, ForecastParams, ForecastResponse, RawForecastResponse } from "./types";

const FREE_API_URL = "https://api.open-meteo.com/v1";
const CUSTOMER_API_URL = "https://customer-api.open-meteo.com/v1";

/**
 * Default ky instance with optimized configuration
 */
const defaultApi = ky.create({
  prefixUrl: FREE_API_URL,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
});

/**
 * Fetch weather forecast data from Open-Meteo API
 *
 * @param params - Forecast parameters including location and requested variables
 * @param config - Optional configuration for API client (baseUrl, apiKey, timeout)
 * @returns Typed forecast response based on requested variables
 *
 * @example
 * ```ts
 * // Free API
 * const forecast = await forecastAPI({
 *   latitude: 52.52,
 *   longitude: 13.41,
 *   hourly: ['temperature_2m', 'cloud_cover'],
 *   daily: ['temperature_2m_max', 'temperature_2m_min'],
 * });
 *
 * // Commercial API with API key (automatically uses customer-api.open-meteo.com)
 * const forecastPro = await forecastAPI({
 *   latitude: 52.52,
 *   longitude: 13.41,
 *   hourly: ['temperature_2m'],
 * }, {
 *   apiKey: 'your-api-key-here'
 * });
 *
 * // Self-hosted instance
 * const forecastSelfHosted = await forecastAPI({
 *   latitude: 52.52,
 *   longitude: 13.41,
 *   hourly: ['temperature_2m'],
 * }, {
 *   baseUrl: 'https://your-domain.com/v1'
 * });
 *
 * // TypeScript knows the exact shape:
 * forecast.hourly[0].temperature_2m;    // number
 * forecast.hourly[0].cloud_cover;       // number
 * forecast.daily[0].temperature_2m_max; // number
 * ```
 */
export async function forecastAPI<T extends ForecastParams>(
  params: T,
  config?: ForecastAPIConfig
): Promise<ForecastResponse<T>> {
  const validatedParams = forecastParamsSchema.parse(params);
  const { hourly, daily, current, ...scalarParams } = validatedParams;

  const searchParams: Record<string, any> = {
    ...scalarParams,
    timeformat: "unixtime",
  };

  if (config?.apiKey) {
    searchParams.apikey = config.apiKey;
  }

  const baseUrl = config?.baseUrl || (config?.apiKey ? CUSTOMER_API_URL : FREE_API_URL);

  const api =
    baseUrl !== FREE_API_URL || config?.timeout
      ? ky.create({
          prefixUrl: baseUrl,
          timeout: config?.timeout || 30000,
          retry: {
            limit: 2,
            methods: ["get"],
            statusCodes: [408, 413, 429, 500, 502, 503, 504],
          },
        })
      : defaultApi;

  if (hourly && hourly.length > 0) {
    searchParams.hourly = hourly.join(",");
  }
  if (daily && daily.length > 0) {
    searchParams.daily = daily.join(",");
  }
  if (current && current.length > 0) {
    searchParams.current = current.join(",");
  }

  const rawResponse = await api.get("forecast", { searchParams }).json();
  const validatedResponse = rawForecastResponseSchema.parse(rawResponse);
  const transformed = transformForecastResponse(validatedResponse as RawForecastResponse);

  return transformed as ForecastResponse<T>;
}
