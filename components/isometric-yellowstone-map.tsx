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

interface IsometricYellowstoneMapProps {
  sightings: Sighting[]
  onMarkerClick: (sighting: Sighting) => void
  selectedSighting: Sighting | null
  hoveredSighting?: string | null // New prop for hover state
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

// Historical buildings and landmarks
const HISTORICAL_PLACES = [
  {
    name: "Old Faithful Inn",
    lat: 44.4605,
    lng: -110.8281,
    type: "historic_lodge",
    built: 1904,
    description: "Historic log hotel, largest log structure in the world",
  },
  {
    name: "Lake Yellowstone Hotel",
    lat: 44.4605,
    lng: -110.3725,
    type: "historic_hotel",
    built: 1891,
    description: "Colonial Revival architecture on Yellowstone Lake",
  },
  {
    name: "Mammoth Hot Springs Hotel",
    lat: 44.9766,
    lng: -110.7036,
    type: "historic_hotel",
    built: 1883,
    description: "Historic hotel near park headquarters",
  },
  {
    name: "Roosevelt Lodge",
    lat: 44.8917,
    lng: -110.3917,
    type: "historic_lodge",
    built: 1920,
    description: "Rustic log cabin lodge in Tower area",
  },
  {
    name: "Grant Village",
    lat: 44.4167,
    lng: -110.5667,
    type: "visitor_center",
    built: 1984,
    description: "Modern visitor facilities on Yellowstone Lake",
  },
  {
    name: "Fort Yellowstone",
    lat: 44.9766,
    lng: -110.7036,
    type: "historic_fort",
    built: 1886,
    description: "Former U.S. Army fort, now park headquarters",
  },
  {
    name: "Fishing Bridge Museum",
    lat: 44.5994,
    lng: -110.5472,
    type: "museum",
    built: 1931,
    description: "Historic stone and log museum",
  },
]

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
]

// Water bodies with more detailed shapes
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
]

// Landmarks with proper positioning
const LANDMARKS = [
  { name: "Old Faithful", lat: 44.4605, lng: -110.8281, icon: "⛲", type: "geyser", elevation: 7365 },
  { name: "Grand Prismatic Spring", lat: 44.5249, lng: -110.8378, icon: "🌈", type: "hot_spring", elevation: 7270 },
  { name: "Grand Canyon of Yellowstone", lat: 44.7197, lng: -110.4969, icon: "🏞️", type: "canyon", elevation: 7734 },
  { name: "Mount Washburn", lat: 44.7978, lng: -110.4342, icon: "⛰️", type: "mountain", elevation: 10243 },
  { name: "Lamar Valley", lat: 44.9167, lng: -110.2167, icon: "🌾", type: "valley", elevation: 6500 },
  { name: "Hayden Valley", lat: 44.65, lng: -110.4833, icon: "🦌", type: "valley", elevation: 7800 },
  { lat: 44.8917, lng: -110.3917, icon: "💧", type: "waterfall", elevation: 6600 },
]

interface MapLayers {
  roads: boolean
  water: boolean
  historical: boolean
  heatmap: boolean
  landmarks: boolean
  wildlife: boolean
}

export function IsometricYellowstoneMap({
  sightings,
  onMarkerClick,
  selectedSighting,
  hoveredSighting, // New prop
  onLocationSelect,
  isSelecting,
}: IsometricYellowstoneMapProps) {
  const [mapState, setMapState] = useState({
    centerLat: YELLOWSTONE_BOUNDS.center.lat,
    centerLng: YELLOWSTONE_BOUNDS.center.lng,
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    panOffset: { x: 0, y: 0 },
  })

  const [layers, setLayers] = useState<MapLayers>({
    roads: true,
    water: true,
    historical: true,
    heatmap: true,
    landmarks: true,
    wildlife: true,
  })

  const [heatmapIntensity, setHeatmapIntensity] = useState([0.7])
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [localHoveredSighting, setLocalHoveredSighting] = useState<string | null>(null)
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

  // Fixed coordinate transformation - this ensures markers stay in place
  const coordsToPixels = useCallback(
    (lat: number, lng: number) => {
      const latRange = YELLOWSTONE_BOUNDS.north - YELLOWSTONE_BOUNDS.south
      const lngRange = YELLOWSTONE_BOUNDS.east - YELLOWSTONE_BOUNDS.west

      // Calculate base position relative to map bounds
      const baseX = ((lng - YELLOWSTONE_BOUNDS.west) / lngRange) * mapSize.width
      const baseY = ((YELLOWSTONE_BOUNDS.north - lat) / latRange) * mapSize.height

      // Apply zoom transformation around the center
      const centerX = mapSize.width / 2
      const centerY = mapSize.height / 2

      const zoomedX = centerX + (baseX - centerX) * mapState.zoom
      const zoomedY = centerY + (baseY - centerY) * mapState.zoom

      // Apply pan offset
      return {
        x: zoomedX + mapState.panOffset.x,
        y: zoomedY + mapState.panOffset.y,
      }
    },
    [mapState.zoom, mapState.panOffset],
  )

  // Convert pixel coordinates back to lat/lng with proper rounding
  const pixelsToCoords = useCallback(
    (x: number, y: number): Coordinates => {
      // Remove pan offset
      const adjustedX = x - mapState.panOffset.x
      const adjustedY = y - mapState.panOffset.y

      // Remove zoom transformation
      const centerX = mapSize.width / 2
      const centerY = mapSize.height / 2

      const baseX = centerX + (adjustedX - centerX) / mapState.zoom
      const baseY = centerY + (adjustedY - centerY) / mapState.zoom

      // Convert to lat/lng
      const latRange = YELLOWSTONE_BOUNDS.north - YELLOWSTONE_BOUNDS.south
      const lngRange = YELLOWSTONE_BOUNDS.east - YELLOWSTONE_BOUNDS.west

      const lat = YELLOWSTONE_BOUNDS.north - (baseY / mapSize.height) * latRange
      const lng = YELLOWSTONE_BOUNDS.west + (baseX / mapSize.width) * lngRange

      // Round to 6 decimal places maximum
      return {
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000,
      }
    },
    [mapState.zoom, mapState.panOffset],
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
      panOffset: {
        x: prev.panOffset.x + deltaX,
        y: prev.panOffset.y + deltaY,
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
      panOffset: { x: 0, y: 0 },
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

  // Get historical building marker
  const getHistoricalMarker = (place: any) => {
    switch (place.type) {
      case "historic_lodge":
        return (
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg shadow-lg border-2 border-amber-300 flex items-center justify-center transform rotate-45 hover:scale-110 transition-all duration-200">
              <div className="transform -rotate-45 text-white font-bold text-sm">🏛️</div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-amber-800 rounded-b-full opacity-60"></div>
          </div>
        )
      case "historic_hotel":
        return (
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg shadow-lg border-2 border-blue-300 flex items-center justify-center transform rotate-45 hover:scale-110 transition-all duration-200">
              <div className="transform -rotate-45 text-white font-bold text-sm">🏨</div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-800 rounded-b-full opacity-60"></div>
          </div>
        )
      case "historic_fort":
        return (
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center transform rotate-45 hover:scale-110 transition-all duration-200">
              <div className="transform -rotate-45 text-white font-bold text-sm">🏰</div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-800 rounded-b-full opacity-60"></div>
          </div>
        )
      case "museum":
        return (
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-lg shadow-lg border-2 border-purple-300 flex items-center justify-center transform rotate-45 hover:scale-110 transition-all duration-200">
              <div className="transform -rotate-45 text-white font-bold text-sm">🏛️</div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-purple-800 rounded-b-full opacity-60"></div>
          </div>
        )
      default:
        return (
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg border-2 border-green-300 flex items-center justify-center transform rotate-45 hover:scale-110 transition-all duration-200">
              <div className="transform -rotate-45 text-white font-bold text-sm">🏢</div>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-green-800 rounded-b-full opacity-60"></div>
          </div>
        )
    }
  }

  // Get wildlife marker icon with enhanced hover effects
  const getWildlifeMarker = (type: string, threatLevel: string, isSelected: boolean, isHovered: boolean) => {
    const pulseClass = threatLevel === "high" ? "animate-pulse" : ""
    const hoverClass = isHovered ? "animate-bounce scale-125 shadow-2xl" : ""
    const selectedClass = isSelected ? "scale-125" : ""

    const baseMarker = (emoji: string, bgColor: string, borderColor: string) => (
      <div className={`relative ${pulseClass} ${hoverClass} ${selectedClass} group transition-all duration-300`}>
        <div
          className={`w-10 h-10 ${bgColor} rounded-full shadow-lg border-3 ${borderColor} flex items-center justify-center text-lg hover:scale-110 transition-all duration-200 transform ${
            isHovered ? "ring-4 ring-cyan-400 ring-opacity-50" : ""
          }`}
        >
          <div className="absolute inset-0 bg-white rounded-full opacity-20"></div>
          <span className="relative z-10">{emoji}</span>
        </div>
        <div
          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-3 ${bgColor} rounded-b-full opacity-60`}
        ></div>
        {threatLevel === "high" && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping border-2 border-white"></div>
        )}
        {isHovered && <div className="absolute -inset-2 border-2 border-cyan-400 rounded-full animate-pulse"></div>}
      </div>
    )

    switch (type) {
      case "bear":
        return baseMarker("🐻", "bg-gradient-to-b from-red-400 to-red-600", "border-red-300")
      case "wolf":
        return baseMarker("🐺", "bg-gradient-to-b from-orange-400 to-orange-600", "border-orange-300")
      case "bison":
        return baseMarker("🦬", "bg-gradient-to-b from-amber-500 to-amber-700", "border-amber-400")
      case "elk":
        return baseMarker("🦌", "bg-gradient-to-b from-green-400 to-green-600", "border-green-300")
      case "eagle":
        return baseMarker("🦅", "bg-gradient-to-b from-blue-400 to-blue-600", "border-blue-300")
      case "rare":
        return baseMarker("🦁", "bg-gradient-to-b from-yellow-400 to-yellow-600", "border-yellow-300")
      default:
        return baseMarker("🐾", "bg-gradient-to-b from-purple-400 to-purple-600", "border-purple-300")
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 rounded-lg overflow-hidden border-2 border-green-200 shadow-2xl">
      {/* 3D Isometric Base Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-yellow-100 to-blue-200 transform-gpu">
        {/* 3D Terrain Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-green-300 to-green-400 transform skew-x-12 skew-y-3"></div>
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-yellow-200 to-yellow-300 transform -skew-x-6 skew-y-2"></div>
        </div>

        {/* Topographic 3D grid */}
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="iso-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(139, 69, 19)" strokeWidth="0.5" opacity="0.6" />
              <path d="M 20 0 L 20 40" fill="none" stroke="rgb(139, 69, 19)" strokeWidth="0.2" opacity="0.4" />
              <path d="M 0 20 L 40 20" fill="none" stroke="rgb(139, 69, 19)" strokeWidth="0.2" opacity="0.4" />
            </pattern>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso-grid)" />
        </svg>
      </div>

      {/* Water Bodies Layer with 3D effect */}
      {layers.water && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-90">
            <defs>
              <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <filter id="water-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" />
              </filter>
            </defs>

            {WATER_BODIES.map((water, index) => (
              <g key={index}>
                {renderPolygon(
                  water.coords,
                  "fill-blue-400 stroke-blue-600 stroke-2 cursor-pointer hover:fill-blue-500 transition-colors",
                )}
                {/* 3D Water effect */}
                <g transform="translate(2, 4)">{renderPolygon(water.coords, "fill-blue-800 opacity-30")}</g>
                {/* Water body label */}
                {(() => {
                  const centerCoord = water.coords[Math.floor(water.coords.length / 2)]
                  const { x, y } = coordsToPixels(centerCoord.lat, centerCoord.lng)
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className="fill-white text-sm font-bold pointer-events-none drop-shadow-lg"
                      style={{ fontSize: "12px", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                    >
                      {water.name}
                    </text>
                  )
                })()}
              </g>
            ))}

            {/* Rivers with 3D effect */}
            {RIVERS.map((river, index) => (
              <g key={`river-${index}`}>
                <g transform="translate(1, 2)">{renderPolyline(river.coords, "stroke-blue-800 opacity-40", 4)}</g>
                {renderPolyline(
                  river.coords,
                  "stroke-blue-500 hover:stroke-blue-700 transition-colors cursor-pointer",
                  3,
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Roads Layer with 3D effect */}
      {layers.roads && (
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-90">
            {ROADS.map((road, index) => (
              <g key={index}>
                {/* Road shadow */}
                <g transform="translate(2, 3)">{renderPolyline(road.coords, "stroke-gray-800 opacity-30", 6)}</g>
                {/* Main road */}
                {renderPolyline(
                  road.coords,
                  "stroke-yellow-500 hover:stroke-yellow-600 transition-colors cursor-pointer",
                  4,
                )}
                {/* Road center line */}
                {renderPolyline(road.coords, "stroke-white stroke-dasharray-10-5 opacity-80", 1)}
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
              <radialGradient id="heatmap-gradient-3d" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`rgba(255, 0, 0, ${heatmapIntensity[0]})`} />
                <stop offset="50%" stopColor={`rgba(255, 165, 0, ${heatmapIntensity[0] * 0.6})`} />
                <stop offset="100%" stopColor={`rgba(255, 255, 0, ${heatmapIntensity[0] * 0.2})`} />
              </radialGradient>
            </defs>

            {heatmapData.map((point, index) => {
              const { x, y } = coordsToPixels(point.lat, point.lng)
              const radius = Math.min(point.intensity * 15, 50)

              return (
                <g key={index}>
                  {/* Shadow */}
                  <circle cx={x + 2} cy={y + 4} r={radius} fill="rgba(0,0,0,0.2)" />
                  {/* Main heatmap */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="url(#heatmap-gradient-3d)"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onMouseEnter={() => setHoveredElement({ type: "heatmap", data: point })}
                    onMouseLeave={() => setHoveredElement(null)}
                  />
                </g>
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
        {/* Historical Places Layer */}
        {layers.historical &&
          HISTORICAL_PLACES.map((place, index) => {
            const { x, y } = coordsToPixels(place.lat, place.lng)
            const isVisible = x >= -50 && x <= mapSize.width + 50 && y >= -50 && y <= mapSize.height + 50

            if (!isVisible) return null

            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredElement({ type: "historical", data: place })}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {getHistoricalMarker(place)}
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
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredElement({ type: "landmark", data: landmark })}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className="relative group">
                  <div className="w-8 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-lg border-2 border-yellow-300 flex items-center justify-center hover:scale-110 transition-all duration-200">
                    <span className="text-sm">{landmark.icon}</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-yellow-800 rounded-b-full opacity-60"></div>
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
            const isHovered = hoveredSighting === sighting.id || localHoveredSighting === sighting.id

            return (
              <div
                key={sighting.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-30 ${
                  isSelected ? "z-40" : isHovered ? "z-35" : ""
                }`}
                style={{ left: x, top: y }}
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkerClick(sighting)
                }}
                onMouseEnter={() => setLocalHoveredSighting(sighting.id)}
                onMouseLeave={() => setLocalHoveredSighting(null)}
              >
                {getWildlifeMarker(sighting.type, sighting.threatLevel, isSelected, isHovered)}

                {/* Selection Ring */}
                {isSelected && (
                  <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 translate-x-5 translate-y-5 border-3 border-cyan-400 rounded-full animate-ping"></div>
                )}

                {/* Hover Tooltip */}
                {(isHovered || localHoveredSighting === sighting.id) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap z-50 border border-white/20 shadow-xl">
                    <div className="font-semibold">{sighting.species}</div>
                    <div className="text-xs opacity-80">{sighting.threatLevel} threat</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                  </div>
                )}
              </div>
            )
          })}

        {/* Location Selection Indicator */}
        {isSelecting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium border border-cyan-300 shadow-lg">
            Click on the map to select location
          </div>
        )}

        {/* Hovered Element Info */}
        {hoveredElement && (
          <div className="absolute top-4 right-4 bg-white/95 text-gray-800 p-4 rounded-lg text-sm border border-gray-300 max-w-xs shadow-xl backdrop-blur-sm z-50">
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
            {hoveredElement.type === "historical" && (
              <div>
                <div className="font-semibold text-amber-700">{hoveredElement.data.name}</div>
                <div className="text-sm text-gray-600 mb-1">{hoveredElement.data.description}</div>
                <div className="text-xs text-gray-500">Built: {hoveredElement.data.built}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
        <Button
          size="sm"
          onClick={zoomIn}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-lg backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={zoomOut}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-lg backdrop-blur-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={resetView}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-lg backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-lg backdrop-blur-sm"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Control Panel - Fixed z-index */}
      {showLayerPanel && (
        <Card className="absolute top-4 right-20 bg-white/95 border-gray-300 backdrop-blur-sm p-4 min-w-[200px] shadow-xl z-50">
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
              <Label htmlFor="historical" className="text-gray-600">
                Historical Places
              </Label>
              <Switch id="historical" checked={layers.historical} onCheckedChange={() => toggleLayer("historical")} />
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
      <div className="absolute top-2 left-2 text-sm text-gray-700 font-bold bg-white/90 px-3 py-2 rounded-lg border border-gray-300 shadow-lg backdrop-blur-sm">
        Yellowstone National Park - 3D View
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded border border-gray-300 shadow-md">
        Scale: {mapState.zoom.toFixed(1)}x | Layers: {Object.values(layers).filter(Boolean).length}/6
      </div>

      {/* Enhanced 3D Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/95 border-gray-300 backdrop-blur-sm shadow-xl">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="space-y-2 text-xs">
            {layers.historical && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded border border-amber-300 transform rotate-45 flex items-center justify-center">
                    <div className="transform -rotate-45 text-white text-xs">🏛️</div>
                  </div>
                  <span className="text-gray-600">Historic Lodges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded border border-blue-300 transform rotate-45 flex items-center justify-center">
                    <div className="transform -rotate-45 text-white text-xs">🏨</div>
                  </div>
                  <span className="text-gray-600">Historic Hotels</span>
                </div>
              </>
            )}
            {layers.roads && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-500 rounded shadow-sm"></div>
                <span className="text-gray-600">Roads</span>
              </div>
            )}
            {layers.water && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-b from-blue-400 to-blue-600 rounded border border-blue-600 shadow-sm"></div>
                <span className="text-gray-600">Water Bodies</span>
              </div>
            )}
            {layers.wildlife && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-b from-red-400 to-red-600 rounded-full border-2 border-red-300 flex items-center justify-center shadow-sm">
                  🐻
                </div>
                <span className="text-gray-600">Wildlife Sightings</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
