"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { Sighting, Coordinates } from "../types/wildlife"

interface YellowstoneMapProps {
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

// Yellowstone landmarks
const LANDMARKS = [
  { name: "Old Faithful", lat: 44.4605, lng: -110.8281, icon: "⛲", type: "geyser" },
  { name: "Grand Prismatic Spring", lat: 44.5249, lng: -110.8378, icon: "🌈", type: "hot_spring" },
  { name: "Mammoth Hot Springs", lat: 44.9766, lng: -110.7036, icon: "🏔️", type: "hot_spring" },
  { name: "Grand Canyon of Yellowstone", lat: 44.7197, lng: -110.4969, icon: "🏞️", type: "canyon" },
  { name: "Yellowstone Lake", lat: 44.4605, lng: -110.3725, icon: "🏔️", type: "lake" },
  { name: "Mount Washburn", lat: 44.7978, lng: -110.4342, icon: "⛰️", type: "mountain" },
  { name: "Lamar Valley", lat: 44.9167, lng: -110.2167, icon: "🌾", type: "valley" },
  { name: "Hayden Valley", lat: 44.65, lng: -110.4833, icon: "🦌", type: "valley" },
  { name: "Tower Fall", lat: 44.8917, lng: -110.3917, icon: "💧", type: "waterfall" },
  { name: "West Thumb", lat: 44.4167, lng: -110.5667, icon: "🌊", type: "geyser_basin" },
]

export function YellowstoneMap({
  sightings,
  onMarkerClick,
  selectedSighting,
  onLocationSelect,
  isSelecting,
}: YellowstoneMapProps) {
  const [mapState, setMapState] = useState({
    centerLat: YELLOWSTONE_BOUNDS.center.lat,
    centerLng: YELLOWSTONE_BOUNDS.center.lng,
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  })

  const [hoveredSighting, setHoveredSighting] = useState<string | null>(null)
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapSize = { width: 800, height: 600 }

  // Convert lat/lng to pixel coordinates with zoom and pan
  const coordsToPixels = useCallback(
    (lat: number, lng: number) => {
      const latRange = YELLOWSTONE_BOUNDS.north - YELLOWSTONE_BOUNDS.south
      const lngRange = YELLOWSTONE_BOUNDS.east - YELLOWSTONE_BOUNDS.west

      // Base coordinates
      const baseX = ((lng - YELLOWSTONE_BOUNDS.west) / lngRange) * mapSize.width
      const baseY = ((YELLOWSTONE_BOUNDS.north - lat) / latRange) * mapSize.height

      // Apply zoom
      const zoomedX = (baseX - mapSize.width / 2) * mapState.zoom + mapSize.width / 2
      const zoomedY = (baseY - mapSize.height / 2) * mapState.zoom + mapSize.height / 2

      // Apply pan offset
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
      // Remove pan offset
      const adjustedX = x - mapState.dragOffset.x
      const adjustedY = y - mapState.dragOffset.y

      // Remove zoom
      const baseX = (adjustedX - mapSize.width / 2) / mapState.zoom + mapSize.width / 2
      const baseY = (adjustedY - mapSize.height / 2) / mapState.zoom + mapSize.height / 2

      // Convert to lat/lng
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
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-900 via-yellow-900 to-green-800 rounded-lg overflow-hidden">
      {/* Map Background - Yellowstone terrain */}
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

        {/* Terrain Features */}
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
        {/* Landmarks */}
        {LANDMARKS.map((landmark) => {
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
            >
              <div className="w-6 h-6 rounded-full bg-yellow-500/80 flex items-center justify-center text-sm border border-yellow-300 hover:scale-110 transition-transform">
                {landmark.icon}
              </div>

              {/* Landmark Tooltip */}
              {hoveredLandmark === landmark.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-yellow-200 text-xs rounded whitespace-nowrap z-30 border border-yellow-500/30">
                  {landmark.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              )}
            </div>
          )
        })}

        {/* Wildlife Sighting Markers */}
        {sightings.map((sighting) => {
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
      </div>

      {/* Coordinates Display */}
      <div className="absolute top-2 left-2 text-xs text-yellow-200 font-mono bg-black/40 px-2 py-1 rounded border border-yellow-500/30">
        Yellowstone National Park
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-yellow-200 font-mono bg-black/40 px-2 py-1 rounded border border-yellow-500/30">
        Zoom: {mapState.zoom.toFixed(1)}x
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 bg-black/70 border-yellow-500/30 backdrop-blur-sm">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-yellow-200 mb-2">Wildlife & Landmarks</h4>
          <div className="space-y-1 text-xs">
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs">🦌</div>
              <span className="text-gray-200">Elk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-xs">⛲</div>
              <span className="text-gray-200">Landmarks</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
