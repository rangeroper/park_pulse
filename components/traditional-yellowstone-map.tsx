"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Layers, Thermometer } from "lucide-react"
import type { Sighting, Coordinates } from "../types/wildlife"

interface TraditionalYellowstoneMapProps {
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

// Major roads in Yellowstone
const ROADS = [
  // Grand Loop Road (main loop)
  {
    name: "Grand Loop Road",
    type: "primary",
    coords: [
      { lat: 44.9766, lng: -110.7036 }, // Mammoth
      { lat: 44.8917, lng: -110.3917 }, // Tower Junction
      { lat: 44.7978, lng: -110.4342 }, // Mount Washburn area
      { lat: 44.7197, lng: -110.4969 }, // Canyon
      { lat: 44.65, lng: -110.4833 }, // Hayden Valley
      { lat: 44.5994, lng: -110.5472 }, // Fishing Bridge
      { lat: 44.4605, lng: -110.3725 }, // Lake area
      { lat: 44.4167, lng: -110.5667 }, // West Thumb
      { lat: 44.4605, lng: -110.8281 }, // Old Faithful
      { lat: 44.5249, lng: -110.8378 }, // Grand Prismatic
      { lat: 44.6833, lng: -110.8167 }, // Madison
      { lat: 44.8333, lng: -110.7833 }, // Norris
      { lat: 44.9766, lng: -110.7036 }, // Back to Mammoth
    ],
  },
  // Entrance roads
  {
    name: "North Entrance Road",
    type: "secondary",
    coords: [
      { lat: 45.0, lng: -110.7 },
      { lat: 44.9766, lng: -110.7036 },
    ],
  },
  {
    name: "Northeast Entrance Road",
    type: "secondary",
    coords: [
      { lat: 44.9167, lng: -110.2167 }, // Lamar Valley
      { lat: 44.8917, lng: -110.3917 }, // Tower Junction
    ],
  },
  {
    name: "East Entrance Road",
    type: "secondary",
    coords: [
      { lat: 44.5, lng: -109.9 },
      { lat: 44.5994, lng: -110.5472 },
    ],
  },
  {
    name: "South Entrance Road",
    type: "secondary",
    coords: [
      { lat: 44.1, lng: -110.65 },
      { lat: 44.4167, lng: -110.5667 },
    ],
  },
  {
    name: "West Entrance Road",
    type: "secondary",
    coords: [
      { lat: 44.65, lng: -111.1 },
      { lat: 44.6833, lng: -110.8167 },
    ],
  },
]

// Water bodies (lakes and rivers)
const WATER_BODIES = [
  // Yellowstone Lake
  {
    name: "Yellowstone Lake",
    type: "lake",
    coords: [
      { lat: 44.4, lng: -110.4 },
      { lat: 44.5, lng: -110.35 },
      { lat: 44.52, lng: -110.25 },
      { lat: 44.48, lng: -110.2 },
      { lat: 44.42, lng: -110.22 },
      { lat: 44.38, lng: -110.28 },
      { lat: 44.36, lng: -110.35 },
      { lat: 44.38, lng: -110.42 },
    ],
  },
  // Shoshone Lake
  {
    name: "Shoshone Lake",
    type: "lake",
    coords: [
      { lat: 44.35, lng: -110.78 },
      { lat: 44.37, lng: -110.75 },
      { lat: 44.36, lng: -110.72 },
      { lat: 44.34, lng: -110.74 },
    ],
  },
  // Lewis Lake
  {
    name: "Lewis Lake",
    type: "lake",
    coords: [
      { lat: 44.28, lng: -110.58 },
      { lat: 44.3, lng: -110.56 },
      { lat: 44.29, lng: -110.54 },
      { lat: 44.27, lng: -110.56 },
    ],
  },
]

// Rivers
const RIVERS = [
  // Yellowstone River
  {
    name: "Yellowstone River",
    coords: [
      { lat: 44.4605, lng: -110.3725 }, // From lake
      { lat: 44.5994, lng: -110.5472 }, // Fishing Bridge
      { lat: 44.65, lng: -110.4833 }, // Hayden Valley
      { lat: 44.7197, lng: -110.4969 }, // Canyon
      { lat: 44.8917, lng: -110.3917 }, // Tower Fall
      { lat: 44.9167, lng: -110.2167 }, // Lamar Valley
    ],
  },
  // Madison River
  {
    name: "Madison River",
    coords: [
      { lat: 44.6833, lng: -110.8167 }, // Madison Junction
      { lat: 44.65, lng: -110.9 },
      { lat: 44.6, lng: -111.0 },
    ],
  },
  // Firehole River
  {
    name: "Firehole River",
    coords: [
      { lat: 44.4605, lng: -110.8281 }, // Old Faithful area
      { lat: 44.5249, lng: -110.8378 }, // Grand Prismatic
      { lat: 44.6833, lng: -110.8167 }, // Madison Junction
    ],
  },
]

// Hiking trails
const TRAILS = [
  {
    name: "Mount Washburn Trail",
    difficulty: "moderate",
    coords: [
      { lat: 44.7978, lng: -110.4342 },
      { lat: 44.8, lng: -110.43 },
      { lat: 44.82, lng: -110.425 },
    ],
  },
  {
    name: "Grand Prismatic Overlook",
    difficulty: "easy",
    coords: [
      { lat: 44.5249, lng: -110.8378 },
      { lat: 44.528, lng: -110.835 },
      { lat: 44.532, lng: -110.832 },
    ],
  },
  {
    name: "Uncle Tom's Trail",
    difficulty: "moderate",
    coords: [
      { lat: 44.7197, lng: -110.4969 },
      { lat: 44.718, lng: -110.495 },
      { lat: 44.716, lng: -110.493 },
    ],
  },
  {
    name: "Lamar Valley Wildlife Loop",
    difficulty: "easy",
    coords: [
      { lat: 44.9167, lng: -110.2167 },
      { lat: 44.92, lng: -110.21 },
      { lat: 44.925, lng: -110.205 },
      { lat: 44.92, lng: -110.2 },
      { lat: 44.915, lng: -110.205 },
    ],
  },
]

// Park facilities
const FACILITIES = [
  { name: "Old Faithful Visitor Center", lat: 44.4605, lng: -110.8281, type: "visitor_center" },
  { name: "Canyon Visitor Center", lat: 44.7197, lng: -110.4969, type: "visitor_center" },
  { name: "Mammoth Hot Springs Hotel", lat: 44.9766, lng: -110.7036, type: "lodging" },
  { name: "Lake Yellowstone Hotel", lat: 44.4605, lng: -110.3725, type: "lodging" },
  { name: "Grant Village", lat: 44.4167, lng: -110.5667, type: "lodging" },
  { name: "Tower Fall Campground", lat: 44.8917, lng: -110.3917, type: "camping" },
  { name: "Madison Campground", lat: 44.6833, lng: -110.8167, type: "camping" },
]

// Landmarks with proper positioning
const LANDMARKS = [
  { name: "Old Faithful", lat: 44.4605, lng: -110.8281, icon: "⛲", type: "geyser", elevation: 7365 },
  { name: "Grand Prismatic Spring", lat: 44.5249, lng: -110.8378, icon: "🌈", type: "hot_spring", elevation: 7270 },
  { name: "Mammoth Hot Springs", lat: 44.9766, lng: -110.7036, icon: "🏔️", type: "hot_spring", elevation: 6239 },
  { name: "Grand Canyon of Yellowstone", lat: 44.7197, lng: -110.4969, icon: "🏞️", type: "canyon", elevation: 7734 },
  { name: "Mount Washburn", lat: 44.7978, lng: -110.4342, icon: "⛰️", type: "mountain", elevation: 10243 },
  { name: "Lamar Valley", lat: 44.9167, lng: -110.2167, icon: "🌾", type: "valley", elevation: 6500 },
  { name: "Hayden Valley", lat: 44.65, lng: -110.4833, icon: "🦌", type: "valley", elevation: 7800 },
  { name: "Tower Fall", lat: 44.8917, lng: -110.3917, icon: "💧", type: "waterfall", elevation: 6600 },
]

interface MapLayers {
  roads: boolean
  water: boolean
  trails: boolean
  facilities: boolean
  heatmap: boolean
  landmarks: boolean
  wildlife: boolean
}

export function TraditionalYellowstoneMap({
  sightings,
  onMarkerClick,
  selectedSighting,
  onLocationSelect,
  isSelecting,
}: TraditionalYellowstoneMapProps) {
  const [mapState, setMapState] = useState({
    centerLat: YELLOWSTONE_BOUNDS.center.lat,
    centerLng: YELLOWSTONE_BOUNDS.center.lng,
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  })

  const [layers, setLayers] = useState<MapLayers>({
    roads: true,
    water: true,
    trails: true,
    facilities: true,
    heatmap: true,
    landmarks: true,
    wildlife: true,
  })

  const [heatmapIntensity, setHeatmapIntensity] = useState([0.7])
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [hoveredSighting, setHoveredSighting] = useState<string | null>(null)
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

  // Check if coordinates are within Yellowstone bounds
  const isWithinYellowstone = (coords: Coordinates): boolean => {
    return (
      coords.lat >= YELLOWSTONE_BOUNDS.south &&
      coords.lat <= YELLOWSTONE_BOUNDS.north &&
      coords.lng >= YELLOWSTONE_BOUNDS.west &&
      coords.lng <= YELLOWSTONE_BOUNDS.east
    )
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

  // Render polyline from coordinates
  const renderPolyline = (coords: Coordinates[], className: string, strokeWidth = 2) => {
    const points = coords
      .map((coord) => {
        const { x, y } = coordsToPixels(coord.lat, coord.lng)
        return `${x},${y}`
      })
      .join(" ")

    return <polyline points={points} className={className} fill="none" strokeWidth={strokeWidth} />
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

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 rounded-lg overflow-hidden border-2 border-green-200">
      {/* Base Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-yellow-100">
        {/* Topographic grid */}
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="topo-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(139, 69, 19)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-grid)" />
        </svg>
      </div>

      {/* Water Bodies Layer */}
      {layers.water && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-80">
            {WATER_BODIES.map((water, index) => (
              <g key={index}>
                {renderPolygon(
                  water.coords,
                  "fill-blue-400 stroke-blue-600 stroke-1 cursor-pointer hover:fill-blue-500 transition-colors",
                )}
                {/* Water body label */}
                {(() => {
                  const centerCoord = water.coords[Math.floor(water.coords.length / 2)]
                  const { x, y } = coordsToPixels(centerCoord.lat, centerCoord.lng)
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className="fill-blue-800 text-xs font-medium pointer-events-none"
                      style={{ fontSize: "10px" }}
                    >
                      {water.name}
                    </text>
                  )
                })()}
              </g>
            ))}

            {/* Rivers */}
            {RIVERS.map((river, index) => (
              <g key={`river-${index}`}>
                {renderPolyline(
                  river.coords,
                  "stroke-blue-500 hover:stroke-blue-700 transition-colors cursor-pointer",
                  3,
                )}
                {/* River label */}
                {(() => {
                  const midPoint = river.coords[Math.floor(river.coords.length / 2)]
                  const { x, y } = coordsToPixels(midPoint.lat, midPoint.lng)
                  return (
                    <text
                      x={x}
                      y={y - 5}
                      textAnchor="middle"
                      className="fill-blue-700 text-xs font-medium pointer-events-none"
                      style={{ fontSize: "9px" }}
                    >
                      {river.name}
                    </text>
                  )
                })()}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Roads Layer */}
      {layers.roads && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-90">
            {ROADS.map((road, index) => (
              <g key={index}>
                {renderPolyline(
                  road.coords,
                  road.type === "primary"
                    ? "stroke-yellow-600 hover:stroke-yellow-800 transition-colors cursor-pointer"
                    : "stroke-gray-600 hover:stroke-gray-800 transition-colors cursor-pointer",
                  road.type === "primary" ? 4 : 2,
                )}
                {/* Road label */}
                {road.type === "primary" &&
                  (() => {
                    const midPoint = road.coords[Math.floor(road.coords.length / 2)]
                    const { x, y } = coordsToPixels(midPoint.lat, midPoint.lng)
                    return (
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        className="fill-yellow-800 text-xs font-bold pointer-events-none"
                        style={{ fontSize: "10px" }}
                      >
                        {road.name}
                      </text>
                    )
                  })()}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Trails Layer */}
      {layers.trails && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-70">
            {TRAILS.map((trail, index) => (
              <g key={index}>
                {renderPolyline(
                  trail.coords,
                  trail.difficulty === "easy"
                    ? "stroke-green-600 stroke-dasharray-5-5 hover:stroke-green-800 transition-colors cursor-pointer"
                    : trail.difficulty === "moderate"
                      ? "stroke-orange-600 stroke-dasharray-5-5 hover:stroke-orange-800 transition-colors cursor-pointer"
                      : "stroke-red-600 stroke-dasharray-5-5 hover:stroke-red-800 transition-colors cursor-pointer",
                  2,
                )}
              </g>
            ))}
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
        {/* Facilities Layer */}
        {layers.facilities &&
          FACILITIES.map((facility, index) => {
            const { x, y } = coordsToPixels(facility.lat, facility.lng)
            const isVisible = x >= -50 && x <= mapSize.width + 50 && y >= -50 && y <= mapSize.height + 50

            if (!isVisible) return null

            const icon = facility.type === "visitor_center" ? "ℹ️" : facility.type === "lodging" ? "🏨" : "⛺"

            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-5"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredElement({ type: "facility", data: facility })}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-sm border-2 border-gray-400 hover:scale-110 transition-transform shadow-md">
                  {icon}
                </div>
              </div>
            )
          })}

        {/* Landmarks Layer */}
        {layers.landmarks &&
          LANDMARKS.map((landmark, index) => {
            const { x, y } = coordsToPixels(landmark.lat, landmark.lng)
            const isVisible = x >= -50 && x <= mapSize.width + 50 && y >= -50 && y <= mapSize.height + 50

            if (!isVisible) return null

            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-5"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredElement({ type: "landmark", data: landmark })}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className="w-7 h-7 rounded-full bg-yellow-400/90 flex items-center justify-center text-sm border-2 border-yellow-600 hover:scale-110 transition-transform shadow-lg">
                  {landmark.icon}
                </div>
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
          <div className="absolute top-4 right-4 bg-white/95 text-gray-800 p-3 rounded-lg text-sm border border-gray-300 max-w-xs shadow-lg">
            {hoveredElement.type === "heatmap" && (
              <div>
                <div className="font-semibold text-orange-600">Wildlife Activity</div>
                <div>Sightings: {hoveredElement.data.intensity}</div>
                <div className="text-xs opacity-80">
                  {hoveredElement.data.lat.toFixed(4)}°, {hoveredElement.data.lng.toFixed(4)}°
                </div>
              </div>
            )}
            {hoveredElement.type === "landmark" && (
              <div>
                <div className="font-semibold text-yellow-700">{hoveredElement.data.name}</div>
                <div className="capitalize">{hoveredElement.data.type.replace("_", " ")}</div>
                <div>Elevation: {hoveredElement.data.elevation}ft</div>
              </div>
            )}
            {hoveredElement.type === "facility" && (
              <div>
                <div className="font-semibold text-blue-700">{hoveredElement.data.name}</div>
                <div className="capitalize">{hoveredElement.data.type.replace("_", " ")}</div>
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
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-md"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={zoomOut}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-md"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={resetView}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-md"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Control Panel */}
      {showLayerPanel && (
        <Card className="absolute top-4 right-20 bg-white/95 border-gray-300 backdrop-blur-sm p-4 min-w-[200px] shadow-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Layers
          </h4>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="roads" className="text-gray-600">
                Roads
              </Label>
              <Switch id="roads" checked={layers.roads} onCheckedChange={() => toggleLayer("roads")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="water" className="text-gray-600">
                Water Bodies
              </Label>
              <Switch id="water" checked={layers.water} onCheckedChange={() => toggleLayer("water")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="trails" className="text-gray-600">
                Hiking Trails
              </Label>
              <Switch id="trails" checked={layers.trails} onCheckedChange={() => toggleLayer("trails")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="facilities" className="text-gray-600">
                Facilities
              </Label>
              <Switch id="facilities" checked={layers.facilities} onCheckedChange={() => toggleLayer("facilities")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="heatmap" className="text-gray-600 flex items-center gap-2">
                <Thermometer className="w-3 h-3" />
                Heatmap
              </Label>
              <Switch id="heatmap" checked={layers.heatmap} onCheckedChange={() => toggleLayer("heatmap")} />
            </div>

            {layers.heatmap && (
              <div className="ml-4">
                <Label className="text-gray-500 text-xs">Intensity</Label>
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
              <Label htmlFor="landmarks" className="text-gray-600">
                Landmarks
              </Label>
              <Switch id="landmarks" checked={layers.landmarks} onCheckedChange={() => toggleLayer("landmarks")} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="wildlife" className="text-gray-600">
                Wildlife
              </Label>
              <Switch id="wildlife" checked={layers.wildlife} onCheckedChange={() => toggleLayer("wildlife")} />
            </div>
          </div>
        </Card>
      )}

      {/* Map Title and Scale */}
      <div className="absolute top-2 left-2 text-sm text-gray-700 font-semibold bg-white/90 px-3 py-1 rounded border border-gray-300 shadow-sm">
        Yellowstone National Park
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded border border-gray-300">
        Scale: {mapState.zoom.toFixed(1)}x | Layers: {Object.values(layers).filter(Boolean).length}/7
      </div>

      {/* Traditional Map Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/95 border-gray-300 backdrop-blur-sm shadow-lg">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            {layers.roads && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-yellow-600 rounded"></div>
                  <span className="text-gray-600">Main Roads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
                  <span className="text-gray-600">Secondary Roads</span>
                </div>
              </>
            )}
            {layers.water && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-blue-400 rounded border border-blue-600"></div>
                  <span className="text-gray-600">Lakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Rivers</span>
                </div>
              </>
            )}
            {layers.trails && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-600 rounded border-dashed border border-green-600"></div>
                <span className="text-gray-600">Hiking Trails</span>
              </div>
            )}
            {layers.facilities && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full border border-gray-400 flex items-center justify-center text-xs">
                    ℹ️
                  </div>
                  <span className="text-gray-600">Visitor Centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full border border-gray-400 flex items-center justify-center text-xs">
                    🏨
                  </div>
                  <span className="text-gray-600">Lodging</span>
                </div>
              </>
            )}
            {layers.wildlife && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-xs">🐻</div>
                <span className="text-gray-600">Wildlife Sightings</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
