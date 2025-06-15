export interface Coordinates {
  lat: number
  lng: number
}

export interface Sighting {
  id: string
  type: string
  species: string
  coordinates: Coordinates
  timestamp: string
  reporterId: string
  description: string
  threatLevel: "low" | "medium" | "high"
  verified: boolean
  images: string[]
}

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  joinDate: string
  sightingsCount: number
  verified: boolean
  bio: string
}

export const YELLOWSTONE_BOUNDS = {
  north: 45.1,
  south: 44.1,
  east: -109.9,
  west: -111.2,
  center: { lat: 44.6, lng: -110.5 },
}

export const isWithinYellowstone = (coords: Coordinates): boolean => {
  // Round coordinates to 6 decimal places for consistent comparison
  const lat = Math.round(coords.lat * 1000000) / 1000000
  const lng = Math.round(coords.lng * 1000000) / 1000000

  return (
    lat >= YELLOWSTONE_BOUNDS.south &&
    lat <= YELLOWSTONE_BOUNDS.north &&
    lng >= YELLOWSTONE_BOUNDS.west &&
    lng <= YELLOWSTONE_BOUNDS.east
  )
}
