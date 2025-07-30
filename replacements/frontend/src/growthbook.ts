import { GrowthBook } from '@growthbook/growthbook-react'

export const createGrowthbookInstance = (clientKey: string) => {
  const isDev = import.meta.env.MODE === 'development'

  return new GrowthBook({
    apiHost: 'https://cdn.growthbook.io',
    clientKey: clientKey,
    // Enable easier debugging during development
    enableDevMode: isDev,
  })
}
