"use client"

import { useState, useRef } from "react"
import { Card } from "./ui/card"
import type { Sighting } from "../types/wildlife"

interface WildlifeMapProps {
  sightings: Sighting[]
  onMarkerClick: (sighting: Sighting) => void
  selectedSighting: Sighting | null
}

export function WildlifeMap({ sightings, onMarkerClick, selectedSighting }: WildlifeMapProps) {
  const [mapBounds, setMapBounds] = useState({
    minLat: 45.0,
    maxLat: 46.0,
    minLng: -123.0,
    maxLng: -122.0,
  })
  const [hoveredSighting, setHoveredSighting] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Convert lat/lng to pixel coordinates
  const coordsToPixels = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * width
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * height
    return { x, y }
  }

  // Get marker icon based on wildlife type
  const getMarkerIcon = (type: string, threatLevel: string) => {
    const baseSize = 24
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
      case "rare":
        return (
          <div className={`relative ${pulseClass}`}>
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-yellow-300">
              🦁
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-600 rounded-full animate-ping"></div>
          </div>
        )
      case "deer":
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
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-purple-300">
            🐾
          </div>
        )
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(139, 92, 246)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Terrain Features */}
        <div className="absolute inset-0">
          {/* Mountains */}
          <div className="absolute top-10 left-20 w-32 h-20 bg-gradient-to-t from-slate-700 to-slate-600 opacity-30 rounded-full transform rotate-12"></div>
          <div className="absolute top-16 left-40 w-24 h-16 bg-gradient-to-t from-slate-700 to-slate-600 opacity-30 rounded-full transform -rotate-6"></div>

          {/* Forest Areas */}
          <div className="absolute bottom-20 right-20 w-40 h-32 bg-gradient-to-r from-green-900 to-green-800 opacity-20 rounded-full"></div>
          <div className="absolute bottom-32 right-40 w-28 h-24 bg-gradient-to-r from-green-900 to-green-800 opacity-20 rounded-full"></div>

          {/* Water Bodies */}
          <div className="absolute top-1/2 left-1/4 w-20 h-8 bg-gradient-to-r from-blue-800 to-blue-700 opacity-30 rounded-full transform -rotate-12"></div>
        </div>
      </div>

      {/* Coordinate Grid */}
      <div className="absolute top-2 left-2 text-xs text-purple-300 font-mono bg-black/20 px-2 py-1 rounded">
        {mapBounds.maxLat.toFixed(2)}°N, {mapBounds.minLng.toFixed(2)}°W
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-purple-300 font-mono bg-black/20 px-2 py-1 rounded">
        {mapBounds.minLat.toFixed(2)}°N, {mapBounds.maxLng.toFixed(2)}°W
      </div>

      {/* Sighting Markers */}
      <div ref={mapRef} className="absolute inset-0">
        {sightings.map((sighting) => {
          const { x, y } = coordsToPixels(
            sighting.coordinates.lat,
            sighting.coordinates.lng,
            mapRef.current?.clientWidth || 800,
            mapRef.current?.clientHeight || 600,
          )

          const isSelected = selectedSighting?.id === sighting.id
          const isHovered = hoveredSighting === sighting.id

          return (
            <div
              key={sighting.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 ${
                isSelected ? "scale-125 z-20" : isHovered ? "scale-110" : ""
              }`}
              style={{ left: x, top: y }}
              onClick={() => onMarkerClick(sighting)}
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-30">
                  {sighting.species}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 bg-black/60 border-purple-500/20 backdrop-blur-sm">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-white mb-2">Wildlife Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-xs">🐻</div>
              <span className="text-gray-300">Bears</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-xs">🐺</div>
              <span className="text-gray-300">Wolves</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-xs">🦁</div>
              <span className="text-gray-300">Rare Species</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs">🦌</div>
              <span className="text-gray-300">Deer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-xs">🦅</div>
              <span className="text-gray-300">Birds</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Threat Level Indicator */}
      <Card className="absolute top-4 right-4 bg-black/60 border-purple-500/20 backdrop-blur-sm">
        <div className="p-3">
          <h4 className="text-sm font-semibold text-white mb-2">Threat Levels</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Low Risk</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
