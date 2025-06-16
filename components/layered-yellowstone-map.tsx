"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Layers, Mountain, TreePine, Thermometer } from "lucide-react"
import type { Sighting, Coordinates } from "../types/wildlife"

interface LayeredYellowstoneMapProps {
  sightings: Sighting[]
  onMarkerClick: (sighting: Sighting) => void
  selectedSighting: Sighting | null
  onLocationSelect?: (coordinates: Coordinates) => void
  isSelecting?: boolean
}

// Yellowstone National Park boundaries
const YELLOWSTONE_BOUNDS = {
  north: 45.1,
  south: 44.1,
  east: -109.9,
  west: -111.2,
  center: { lat: 44.6, lng: -110.5 },
}

// Yellowstone landmarks with elevation data
const LANDMARKS = [
  { name: "Old Faithful", lat: 44.4605, lng: -110.8281, icon: "⛲", type: "geyser", elevation: 7365 },
  { name: "Grand Prismatic Spring", lat: 44.5249, lng: -110.8378, icon: "🌈", type: "hot_spring", elevation: 7270 },
  { name: "Mammoth Hot Springs", lat: 44.9766, lng: -110.7036, icon: "🏔️", type: "hot_spring", elevation: 6239 },
  { name: "Grand Canyon of Yellowstone", lat: 44.7197, lng: -110.4969, icon: "🏞️", type: "canyon", elevation: 7734 },
  { name: "Yellowstone Lake", lat: 44.4605, lng: -110.3725, icon: "🏔️", type: "lake", elevation: 7732 },
  { name: "Mount Washburn", lat: 44.7978, lng: -110.4342, icon: "⛰️", type: "mountain", elevation: 10243 },
  { name: "Lamar Valley", lat: 44.9167, lng: -110.2167, icon: "🌾", type: "valley", elevation: 6500 },
  { name: "Hayden Valley", lat: 44.65, lng: -110.4833, icon: "🦌", type: "valley", elevation: 7800 },
  { name: "Tower Fall", lat: 44.8917, lng: -110.3917, icon: "💧", type: "waterfall", elevation: 6600 },
  { name: "West Thumb", lat: 44.4167, lng: -110.5667, icon: "🌊", type: "geyser_basin", elevation: 7730 },
]

// Land cover areas
const LAND_COVER_AREAS = [
  // Forests
  {
    type: "forest",
    coords: [
      { lat: 44.8, lng: -110.8 },
      { lat: 44.9, lng: -110.6 },
      { lat: 44.7, lng: -110.5 },
      { lat: 44.6, lng: -110.7 },
    ],
  },
  {
    type: "forest",
    coords: [
      { lat: 44.3, lng: -110.2 },
      { lat: 44.5, lng: -110.1 },
      { lat: 44.4, lng: -110.4 },
      { lat: 44.2, lng: -110.3 },
    ],
  },

  // Grasslands/Meadows
  {
    type: "grassland",
    coords: [
      { lat: 44.9, lng: -110.3 },
      { lat: 45.0, lng: -110.1 },
      { lat: 44.8, lng: -110.0 },
      { lat: 44.7, lng: -110.2 },
    ],
  },
  {
    type: "grassland",
    coords: [
      { lat: 44.6, lng: -110.5 },
      { lat: 44.7, lng: -110.4 },
      { lat: 44.5, lng: -110.3 },
      { lat: 44.4, lng: -110.4 },
    ],
  },

  // Water bodies
  {
    type: "water",
    coords: [
      { lat: 44.4, lng: -110.4 },
      { lat: 44.5, lng: -110.3 },
      { lat: 44.4, lng: -110.2 },
      { lat: 44.3, lng: -110.3 },
    ],
  },

  // Thermal areas
  {
    type: "thermal",
    coords: [
      { lat: 44.5, lng: -110.85 },
      { lat: 44.55, lng: -110.82 },
      { lat: 44.52, lng: -110.8 },
      { lat: 44.47, lng: -110.83 },
    ],
  },
  {
    type: "thermal",
    coords: [
      { lat: 44.97, lng: -110.71 },
      { lat: 44.98, lng: -110.69 },
      { lat: 44.96, lng: -110.68 },
      { lat: 44.95, lng: -110.7 },
    ],
  },
]

// Elevation contour lines (simplified)
const ELEVATION_CONTOURS = [
  // 6000 ft contours
  {
    elevation: 6000,
    coords: [
      { lat: 44.2, lng: -110.8 },
      { lat: 44.3, lng: -110.6 },
      { lat: 44.4, lng: -110.4 },
      { lat: 44.5, lng: -110.2 },
    ],
  },
  {
    elevation: 6000,
    coords: [
      { lat: 44.8, lng: -110.8 },
      { lat: 44.9, lng: -110.6 },
      { lat: 45.0, lng: -110.4 },
    ],
  },

  // 7000 ft contours
  {
    elevation: 7000,
    coords: [
      { lat: 44.3, lng: -110.7 },
      { lat: 44.4, lng: -110.5 },
      { lat: 44.5, lng: -110.3 },
      { lat: 44.6, lng: -110.1 },
    ],
  },
  {
    elevation: 7000,
    coords: [
      { lat: 44.7, lng: -110.7 },
      { lat: 44.8, lng: -110.5 },
      { lat: 44.9, lng: -110.3 },
    ],
  },

  // 8000 ft contours
  {
    elevation: 8000,
    coords: [
      { lat: 44.4, lng: -110.6 },
      { lat: 44.5, lng: -110.4 },
      { lat: 44.6, lng: -110.2 },
    ],
  },
  {
    elevation: 8000,
    coords: [
      { lat: 44.7, lng: -110.6 },
      { lat: 44.8, lng: -110.4 },
    ],
  },

  // 9000 ft contours
  {
    elevation: 9000,
    coords: [
      { lat: 44.75, lng: -110.45 },
      { lat: 44.8, lng: -110.43 },
      { lat: 44.82, lng: -110.41 },
    ],
  },
]

interface MapLayers {
  terrain: boolean
  landCover: boolean
  elevation: boolean
  heatmap: boolean
  landmarks: boolean
  wildlife: boolean
}

export function LayeredYellowstoneMap({
  sightings,
  onMarkerClick,
  selectedSighting,
  onLocationSelect,
  isSelecting,
}: LayeredYellowstoneMapProps) {
  const [mapState, setMapState] = useState({
    centerLat: YELLOWSTONE_BOUNDS.center.lat,
    centerLng: YELLOWSTONE_BOUNDS.center.lng,
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  })

  const [layers, setLayers] = useState<MapLayers>({
    terrain: true,
    landCover: true,
    elevation: false,
    heatmap: true,
    landmarks: true,
    wildlife: true,
  })

  const [heatmapIntensity, setHeatmapIntensity] = useState([0.7])
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [hoveredSighting, setHoveredSighting] = useState<string | null>(null)
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null)
  const [hoveredElement, setHoveredElement] = useState<{ type: string; data: any } | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapSize = { width: 800, height: 600 }

  // Generate heatmap data from sightings
  const heatmapData = useMemo(() => {
    const grid: { [key: string]: number } = {}
    const gridSize = 0.02 // degrees

    sightings.forEach((sighting) => {
      const gridLat = Math.floor(sighting.coordinates.lat / gridSize) * gridSize
      const gridLng = Math.floor(sighting.coordinates.lng / gridSize) * gridSize
      const key = `${gridLat},${gridLng}`
      grid[key] = (grid[key] || 0) + 1
    })

    return Object.entries(grid).map(([key, count]) => {
      const [lat, lng] = key.split(",").map(Number)
      return { lat, lng, intensity: count }
    })
  }, [sightings])

  // Convert lat/lng to pixel coordinates with zoom and pan
  const coordsToPixels = useCallback(
    (lat: number, lng: number) => {
      const latRange = YELLOWSTONE_BOUNDS.north - YELLOWSTONE_BOUNDS.south
      const lngRange = YELLOWSTONE_BOUNDS.east - YELLOWSTONE_BOUNDS.west

      const baseX = ((lng - YELLOWSTONE_BOUNDS.west) / lngRange) * mapSize.width
      const baseY = ((YELLOWSTONE_BOUNDS.north - lat) / latRange) * mapSize.height

      const zoomedX = (baseX - mapSize.width / 2) * mapState.zoom + mapSize.width / 2
      const zoomedY = (baseY - mapSize.height / 2) * mapState.zoom + mapSize.height / 2

      return {
        x: zoomedX + mapState.dragOffset.x,
        y: zoomedY + mapState.dragOffset.y,
      }
    },
    [mapState.zoom, mapState.dragOffset],
  )

  // Convert pixel coordinates back to lat/lng
  const pixelsToCoords = useCallback(
    (x: number, y: number): Coordinates => {
      const adjustedX = x - mapState.dragOffset.x
      const adjustedY = y - mapState.dragOffset.y

      const baseX = (adjustedX - mapSize.width / 2) / mapState.zoom + mapSize.width / 2
      const baseY = (adjustedY - mapSize.height / 2) / mapState.zoom + mapSize.height / 2

      const latRange = YELLOWSTONE_BOUNDS.north - YELLOWSTONE_BOUNDS.south
      const lngRange = YELLOWSTONE_BOUNDS.east - YELLOWSTONE_BOUNDS.west

      const lat = YELLOWSTONE_BOUNDS.north - (baseY / mapSize.height) * latRange
      const lng = YELLOWSTONE_BOUNDS.west + (baseX / mapSize.width) * lngRange

      return { lat, lng }
    },
    [mapState.zoom, mapState.dragOffset],
  )

  // Check if coordinates are within Yellowstone bounds
  const isWithinYellowstone = (coords: Coordinates): boolean => {
    return (
      coords.lat >= YELLOWSTONE_BOUNDS.south &&
      coords.lat <= YELLOWSTONE_BOUNDS.north &&
      coords.lng >= YELLOWSTONE_BOUNDS.west &&
      coords.lng <= YELLOWSTONE_BOUNDS.east
    )
  }

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSelecting) return

    setMapState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
    }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapState.isDragging || isSelecting) return

    const deltaX = e.clientX - mapState.dragStart.x
    const deltaY = e.clientY - mapState.dragStart.y

    setMapState((prev) => ({
      ...prev,
      dragOffset: {
        x: prev.dragOffset.x + deltaX,
        y: prev.dragOffset.y + deltaY,
      },
      dragStart: { x: e.clientX, y: e.clientY },
    }))
  }

  const handleMouseUp = () => {
    setMapState((prev) => ({ ...prev, isDragging: false }))
  }

  // Handle map click for location selection
  const handleMapClick = (e: React.MouseEvent) => {
    if (!isSelecting || !onLocationSelect) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const coords = pixelsToCoords(x, y)

    if (isWithinYellowstone(coords)) {
      onLocationSelect(coords)
    }
  }

  // Zoom functions
  const zoomIn = () => {
    setMapState((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 4) }))
  }

  const zoomOut = () => {
    setMapState((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.5) }))
  }

  const resetView = () => {
    setMapState((prev) => ({
      ...prev,
      zoom: 1,
      dragOffset: { x: 0, y: 0 },
    }))
  }

  // Toggle layer visibility
  const toggleLayer = (layerName: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }))
  }

  // Get marker icon based on wildlife type
  const getMarkerIcon = (type: string, threatLevel: string) => {
    const pulseClass = threatLevel === "high" ? "animate-pulse" : ""

    switch (type) {
      case "bear":
        return (
          <div className={`relative ${pulseClass}`}>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-red-300">
              🐻
            </div>
            {threatLevel === "high" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
            )}
          </div>
        )
      case "wolf":
        return (
          <div className={`relative ${pulseClass}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-orange-300">
              🐺
            </div>
            {threatLevel === "high" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full animate-ping"></div>
            )}
          </div>
        )
      case "bison":
        return (
          <div className={`relative ${pulseClass}`}>
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-lg shadow-lg border-2 border-amber-400">
              🦬
            </div>
            {threatLevel === "high" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-700 rounded-full animate-ping"></div>
            )}
          </div>
        )
      case "elk":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-green-300">
            🦌
          </div>
        )
      case "eagle":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-blue-300">
            🦅
          </div>
        )
      case "rare":
        return (
          <div className={`relative ${pulseClass}`}>
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-yellow-300">
              🦁
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-600 rounded-full animate-ping"></div>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-purple-300">
            🐾
          </div>
        )
    }
  }

  // Render polygon from coordinates
  const renderPolygon = (coords: Coordinates[], className: string) => {
    const points = coords
      .map((coord) => {
        const { x, y } = coordsToPixels(coord.lat, coord.lng)
        return `${x},${y}`
      })
      .join(" ")

    return <polygon points={points} className={className} />
  }

  // Render polyline from coordinates
  const renderPolyline = (coords: Coordinates[], className: string) => {
    const points = coords
      .map((coord) => {
        const { x, y } = coordsToPixels(coord.lat, coord.lng)
        return `${x},${y}`
      })
      .join(" ")

    return <polyline points={points} className={className} fill="none" />
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-900 via-yellow-900 to-green-800 rounded-lg overflow-hidden">
      {/* Base Terrain Layer */}
      {layers.terrain && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-30">
            <defs>
              <pattern id="yellowstone-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(255, 215, 0)" strokeWidth="0.3" />
              </pattern>
              <radialGradient id="geyser-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                <stop offset="100%" stopColor="rgba(255, 215, 0, 0.1)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#yellowstone-grid)" />
          </svg>

          {/* Major terrain features */}
          <div className="absolute inset-0">
            {/* Yellowstone Lake */}
            <div
              className="absolute w-32 h-24 bg-gradient-to-br from-blue-600 to-blue-800 opacity-40 rounded-full"
              style={{
                left: `${coordsToPixels(44.4605, -110.3725).x - 64}px`,
                top: `${coordsToPixels(44.4605, -110.3725).y - 48}px`,
              }}
            ></div>

            {/* Grand Canyon area */}
            <div
              className="absolute w-20 h-40 bg-gradient-to-r from-red-700 to-orange-600 opacity-30 rounded-lg transform rotate-12"
              style={{
                left: `${coordsToPixels(44.7197, -110.4969).x - 40}px`,
                top: `${coordsToPixels(44.7197, -110.4969).y - 80}px`,
              }}
            ></div>

            {/* Lamar Valley */}
            <div
              className="absolute w-40 h-16 bg-gradient-to-r from-green-600 to-yellow-500 opacity-25 rounded-full"
              style={{
                left: `${coordsToPixels(44.9167, -110.2167).x - 80}px`,
                top: `${coordsToPixels(44.9167, -110.2167).y - 32}px`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Land Cover Layer */}
      {layers.landCover && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-40">
            <defs>
              <pattern id="forest-pattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="4" height="4" fill="rgba(34, 139, 34, 0.3)" />
                <circle cx="2" cy="2" r="1" fill="rgba(0, 100, 0, 0.5)" />
              </pattern>
              <pattern id="grassland-pattern" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="rgba(154, 205, 50, 0.3)" />
                <path d="M0,3 Q3,0 6,3 Q3,6 0,3" fill="rgba(124, 252, 0, 0.4)" />
              </pattern>
              <pattern id="thermal-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill="rgba(255, 69, 0, 0.2)" />
                <circle cx="4" cy="4" r="2" fill="rgba(255, 140, 0, 0.4)" />
              </pattern>
            </defs>

            {LAND_COVER_AREAS.map((area, index) => {
              const fillPattern =
                area.type === "forest"
                  ? "url(#forest-pattern)"
                  : area.type === "grassland"
                    ? "url(#grassland-pattern)"
                    : area.type === "thermal"
                      ? "url(#thermal-pattern)"
                      : "rgba(30, 144, 255, 0.3)"

              return renderPolygon(area.coords, `fill-current cursor-pointer hover:opacity-60 transition-opacity`)
            })}
          </svg>
        </div>
      )}

      {/* Elevation Contours Layer */}
      {layers.elevation && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-60">
            {ELEVATION_CONTOURS.map((contour, index) => {
              const strokeColor =
                contour.elevation >= 9000
                  ? "rgb(139, 69, 19)"
                  : contour.elevation >= 8000
                    ? "rgb(160, 82, 45)"
                    : contour.elevation >= 7000
                      ? "rgb(205, 133, 63)"
                      : "rgb(222, 184, 135)"

              return renderPolyline(contour.coords, `stroke-2 hover:stroke-4 transition-all cursor-pointer`)
            })}
          </svg>
        </div>
      )}

      {/* Heatmap Layer */}
      {layers.heatmap && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-60">
            <defs>
              <radialGradient id="heatmap-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`rgba(255, 0, 0, ${heatmapIntensity[0]})`} />
                <stop offset="50%" stopColor={`rgba(255, 165, 0, ${heatmapIntensity[0] * 0.6})`} />
                <stop offset="100%" stopColor={`rgba(255, 255, 0, ${heatmapIntensity[0] * 0.2})`} />
              </radialGradient>
            </defs>

            {heatmapData.map((point, index) => {
              const { x, y } = coordsToPixels(point.lat, point.lng)
              const radius = Math.min(point.intensity * 15, 50)

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="url(#heatmap-gradient)"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => setHoveredElement({ type: "heatmap", data: point })}
                  onMouseLeave={() => setHoveredElement(null)}
                />
              )
            })}
          </svg>
        </div>
      )}

      {/* Interactive Map Container */}
      <div
        ref={mapRef}
        className={`absolute inset-0 ${isSelecting ? "cursor-crosshair" : mapState.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
      >
        {/* Landmarks Layer */}
        {layers.landmarks &&
          LANDMARKS.map((landmark) => {
            const { x, y } = coordsToPixels(landmark.lat, landmark.lng)
            const isVisible = x >= -50 && x <= mapSize.width + 50 && y >= -50 && y <= mapSize.height + 50

            if (!isVisible) return null

            return (
              <div
                key={landmark.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-5"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredLandmark(landmark.name)}
                onMouseLeave={() => setHoveredLandmark(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  setHoveredElement({ type: "landmark", data: landmark })
                }}
              >
                <div className="w-6 h-6 rounded-full bg-yellow-500/80 flex items-center justify-center text-sm border border-yellow-300 hover:scale-110 transition-transform">
                  {landmark.icon}
                </div>

                {/* Landmark Tooltip */}
                {hoveredLandmark === landmark.name && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-yellow-200 text-xs rounded whitespace-nowrap z-30 border border-yellow-500/30">
                    <div className="font-semibold">{landmark.name}</div>
                    <div className="text-xs opacity-80">Elevation: {landmark.elevation}ft</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                  </div>
                )}
              </div>
            )
          })}

        {/* Wildlife Sighting Markers Layer */}
        {layers.wildlife &&
          sightings.map((sighting) => {
            const { x, y } = coordsToPixels(sighting.coordinates.lat, sighting.coordinates.lng)
            const isVisible = x >= -50 && x <= mapSize.width + 50 && y >= -50 && y <= mapSize.height + 50

            if (!isVisible) return null

            const isSelected = selectedSighting?.id === sighting.id
            const isHovered = hoveredSighting === sighting.id

            return (
              <div
                key={sighting.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 ${
                  isSelected ? "scale-125 z-20" : isHovered ? "scale-110" : ""
                }`}
                style={{ left: x, top: y }}
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkerClick(sighting)
                }}
                onMouseEnter={() => setHoveredSighting(sighting.id)}
                onMouseLeave={() => setHoveredSighting(null)}
              >
                {getMarkerIcon(sighting.type, sighting.threatLevel)}

                {/* Selection Ring */}
                {isSelected && (
                  <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 translate-x-4 translate-y-4 border-2 border-cyan-400 rounded-full animate-ping"></div>
                )}

                {/* Hover Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap z-30 border border-white/20">
                    {sighting.species}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                  </div>
                )}
              </div>
            )
          })}

        {/* Location Selection Indicator */}
        {isSelecting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium border border-cyan-300">
            Click on the map to select location
          </div>
        )}

        {/* Hovered Element Info */}
        {hoveredElement && (
          <div className="absolute top-4 right-4 bg-black/90 text-white p-3 rounded-lg text-sm border border-white/20 max-w-xs">
            {hoveredElement.type === "heatmap" && (
              <div>
                <div className="font-semibold text-orange-300">Wildlife Activity</div>
                <div>Sightings: {hoveredElement.data.intensity}</div>
                <div className="text-xs opacity-80">
                  {hoveredElement.data.lat.toFixed(4)}°, {hoveredElement.data.lng.toFixed(4)}°
                </div>
              </div>
            )}
            {hoveredElement.type === "landmark" && (
              <div>
                <div className="font-semibold text-yellow-300">{hoveredElement.data.name}</div>
                <div className="capitalize">{hoveredElement.data.type.replace("_", " ")}</div>
                <div>Elevation: {hoveredElement.data.elevation}ft</div>
                <div className="text-xs opacity-80">
                  {hoveredElement.data.lat.toFixed(4)}°, {hoveredElement.data.lng.toFixed(4)}°
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          onClick={zoomIn}
          className="bg-black/60 hover:bg-black/80 text-white border border-yellow-500/30"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={zoomOut}
          className="bg-black/60 hover:bg-black/80 text-white border border-yellow-500/30"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={resetView}
          className="bg-black/60 hover:bg-black/80 text-white border border-yellow-500/30"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-black/60 hover:bg-black/80 text-white border border-yellow-500/30"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Control Panel */}
      {showLayerPanel && (
        <Card className="absolute top-4 right-20 bg-black/80 border-yellow-500/30 backdrop-blur-sm p-4 min-w-[200px]">
          <h4 className="text-sm font-semibold text-yellow-200 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Layers
          </h4>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="terrain" className="text-gray-200 flex items-center gap-2">
                <Mountain className="w-3 h-3" />
                Terrain
              </Label>
              <Switch id="terrain" checked={layers.terrain} onCheckedChange={() => toggleLayer("terrain")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="landcover" className="text-gray-200 flex items-center gap-2">
                <TreePine className="w-3 h-3" />
                Land Cover
              </Label>
              <Switch id="landcover" checked={layers.landCover} onCheckedChange={() => toggleLayer("landCover")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="elevation" className="text-gray-200">
                Elevation
              </Label>
              <Switch id="elevation" checked={layers.elevation} onCheckedChange={() => toggleLayer("elevation")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="heatmap" className="text-gray-200 flex items-center gap-2">
                <Thermometer className="w-3 h-3" />
                Heatmap
              </Label>
              <Switch id="heatmap" checked={layers.heatmap} onCheckedChange={() => toggleLayer("heatmap")} />
            </div>

            {layers.heatmap && (
              <div className="ml-4">
                <Label className="text-gray-300 text-xs">Intensity</Label>
                <Slider
                  value={heatmapIntensity}
                  onValueChange={setHeatmapIntensity}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="landmarks" className="text-gray-200">
                Landmarks
              </Label>
              <Switch id="landmarks" checked={layers.landmarks} onCheckedChange={() => toggleLayer("landmarks")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="wildlife" className="text-gray-200">
                Wildlife
              </Label>
              <Switch id="wildlife" checked={layers.wildlife} onCheckedChange={() => toggleLayer("wildlife")} />
            </div>
          </div>
        </Card>
      )}

      {/* Coordinates Display */}
      <div className="absolute top-2 left-2 text-xs text-yellow-200 font-mono bg-black/40 px-2 py-1 rounded border border-yellow-500/30">
        Yellowstone National Park - Multi-Layer View
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-yellow-200 font-mono bg-black/40 px-2 py-1 rounded border border-yellow-500/30">
        Zoom: {mapState.zoom.toFixed(1)}x | Layers: {Object.values(layers).filter(Boolean).length}/6
      </div>

      {/* Enhanced Legend */}
      <Card className="absolute bottom-4 left-4 bg-black/80 border-yellow-500/30 backdrop-blur-sm">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-yellow-200 mb-2">Map Legend</h4>
          <div className="space-y-1 text-xs">
            {layers.wildlife && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-xs">🐻</div>
                  <span className="text-gray-200">Bears</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-xs">🐺</div>
                  <span className="text-gray-200">Wolves</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-xs">🦬</div>
                  <span className="text-gray-200">Bison</span>
                </div>
              </>
            )}
            {layers.landmarks && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-xs">⛲</div>
                <span className="text-gray-200">Landmarks</span>
              </div>
            )}
            {layers.heatmap && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded"></div>
                <span className="text-gray-200">Activity Heat</span>
              </div>
            )}
            {layers.elevation && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-600 rounded"></div>
                <span className="text-gray-200">Elevation</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
