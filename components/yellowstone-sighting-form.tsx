"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { X, MapPin, Target } from "lucide-react"
import { IsometricYellowstoneMap } from "./isometric-yellowstone-map"
import type { Sighting, User, Coordinates } from "../types/wildlife"

interface YellowstoneSightingFormProps {
  users: User[]
  onSubmit: (sighting: Omit<Sighting, "id" | "timestamp">) => void
  onClose: () => void
}

// Yellowstone boundaries for validation
const YELLOWSTONE_BOUNDS = {
  north: 45.1,
  south: 44.1,
  east: -109.9,
  west: -111.2,
}

export function YellowstoneSightingForm({ users, onSubmit, onClose }: YellowstoneSightingFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    species: "",
    coordinates: { lat: 44.6, lng: -110.5 }, // Center of Yellowstone
    reporterId: "",
    description: "",
    threatLevel: "low" as "low" | "medium" | "high",
    verified: false,
    images: [] as string[],
  })

  const [showMapSelector, setShowMapSelector] = useState(false)
  const [locationError, setLocationError] = useState("")

  const yellowstoneWildlife = {
    bear: ["Grizzly Bear", "Black Bear"],
    wolf: ["Gray Wolf"],
    bison: ["American Bison"],
    elk: ["Rocky Mountain Elk"],
    deer: ["Mule Deer", "White-tailed Deer"],
    eagle: ["Bald Eagle", "Golden Eagle"],
    rare: ["Mountain Lion", "Lynx", "Wolverine", "Moose"],
  }

  const isWithinYellowstone = (coords: Coordinates): boolean => {
    return (
      coords.lat >= YELLOWSTONE_BOUNDS.south &&
      coords.lat <= YELLOWSTONE_BOUNDS.north &&
      coords.lng >= YELLOWSTONE_BOUNDS.west &&
      coords.lng <= YELLOWSTONE_BOUNDS.east
    )
  }

  const handleCoordinateChange = (field: "lat" | "lng", value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    // Round to 6 decimal places
    const roundedValue = Math.round(numValue * 1000000) / 1000000
    const newCoords = { ...formData.coordinates, [field]: roundedValue }

    setFormData((prev) => ({ ...prev, coordinates: newCoords }))

    if (isWithinYellowstone(newCoords)) {
      setLocationError("")
    } else {
      setLocationError("Location must be within Yellowstone National Park boundaries")
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: Math.round(position.coords.latitude * 1000000) / 1000000,
            lng: Math.round(position.coords.longitude * 1000000) / 1000000,
          }

          setFormData((prev) => ({ ...prev, coordinates: coords }))

          if (isWithinYellowstone(coords)) {
            setLocationError("")
          } else {
            setLocationError("Your current location is outside Yellowstone National Park")
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Unable to get current location")
        },
      )
    }
  }

  const handleLocationSelect = (coordinates: Coordinates) => {
    // Round coordinates to 6 decimal places
    const roundedCoords = {
      lat: Math.round(coordinates.lat * 1000000) / 1000000,
      lng: Math.round(coordinates.lng * 1000000) / 1000000,
    }

    if (isWithinYellowstone(roundedCoords)) {
      setFormData((prev) => ({ ...prev, coordinates: roundedCoords }))
      setShowMapSelector(false)
      setLocationError("")
    } else {
      setLocationError("Location must be within Yellowstone National Park boundaries")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type || !formData.species || !formData.reporterId) return

    if (!isWithinYellowstone(formData.coordinates)) {
      setLocationError("Location must be within Yellowstone National Park boundaries")
      return
    }

    onSubmit({
      type: formData.type,
      species: formData.species,
      coordinates: formData.coordinates,
      reporterId: formData.reporterId,
      description: formData.description,
      threatLevel: formData.threatLevel,
      verified: formData.verified,
      images: formData.images,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-slate-900/95 border-yellow-500/30 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-yellow-500/20">
          <CardTitle className="text-xl font-bold text-yellow-100">Report Yellowstone Wildlife Sighting</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-yellow-300 hover:text-yellow-100 hover:bg-yellow-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {showMapSelector ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-100">Select Location on Map</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowMapSelector(false)}
                  className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  Back to Form
                </Button>
              </div>
              <div className="border border-yellow-500/30 rounded-lg overflow-hidden">
                <IsometricYellowstoneMap
                  sightings={[]}
                  onMarkerClick={() => {}}
                  selectedSighting={null}
                  onLocationSelect={handleLocationSelect}
                  isSelecting={true}
                />
              </div>
              {formData.coordinates && (
                <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                  <p className="text-green-200 text-sm">
                    Selected Location: {formData.coordinates.lat.toFixed(6)}°N,{" "}
                    {Math.abs(formData.coordinates.lng).toFixed(6)}°W
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wildlife Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-yellow-100 font-medium">
                  Wildlife Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value, species: "" }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400">
                    <SelectValue placeholder="Select wildlife type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-yellow-500/30">
                    <SelectItem value="bear">🐻 Bears</SelectItem>
                    <SelectItem value="wolf">🐺 Wolves</SelectItem>
                    <SelectItem value="bison">🦬 Bison</SelectItem>
                    <SelectItem value="elk">🦌 Elk & Deer</SelectItem>
                    <SelectItem value="eagle">🦅 Birds of Prey</SelectItem>
                    <SelectItem value="rare">🦁 Rare Species</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Species */}
              {formData.type && (
                <div className="space-y-2">
                  <Label htmlFor="species" className="text-yellow-100 font-medium">
                    Species
                  </Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, species: value }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400">
                      <SelectValue placeholder="Select specific species" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-yellow-500/30">
                      {yellowstoneWildlife[formData.type as keyof typeof yellowstoneWildlife]?.map((species) => (
                        <SelectItem key={species} value={species} className="text-yellow-100">
                          {species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-yellow-100 font-medium">Location in Yellowstone</Label>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowMapSelector(true)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Select on Map
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Use GPS
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat" className="text-sm text-yellow-200">
                      Latitude
                    </Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      min={YELLOWSTONE_BOUNDS.south}
                      max={YELLOWSTONE_BOUNDS.north}
                      value={formData.coordinates.lat.toFixed(6)}
                      onChange={(e) => handleCoordinateChange("lat", e.target.value)}
                      className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng" className="text-sm text-yellow-200">
                      Longitude
                    </Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.000001"
                      min={YELLOWSTONE_BOUNDS.west}
                      max={YELLOWSTONE_BOUNDS.east}
                      value={formData.coordinates.lng.toFixed(6)}
                      onChange={(e) => handleCoordinateChange("lng", e.target.value)}
                      className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400"
                    />
                  </div>
                </div>

                {locationError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                    <p className="text-red-300 text-sm">{locationError}</p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    Current Location: {formData.coordinates.lat.toFixed(6)}°N,{" "}
                    {Math.abs(formData.coordinates.lng).toFixed(6)}°W
                  </p>
                </div>
              </div>

              {/* Reporter */}
              <div className="space-y-2">
                <Label htmlFor="reporter" className="text-yellow-100 font-medium">
                  Reporter
                </Label>
                <Select
                  value={formData.reporterId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, reporterId: value }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400">
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-yellow-500/30">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-yellow-100">
                        {user.avatar} {user.name} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-yellow-100 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the sighting, behavior, and any relevant details..."
                  className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 min-h-[100px] focus:border-yellow-400 placeholder:text-yellow-300/50"
                />
              </div>

              {/* Threat Level */}
              <div className="space-y-2">
                <Label htmlFor="threat" className="text-yellow-100 font-medium">
                  Threat Level
                </Label>
                <Select
                  value={formData.threatLevel}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, threatLevel: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-yellow-500/30 text-yellow-100 focus:border-yellow-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-yellow-500/30">
                    <SelectItem value="low" className="text-green-300">
                      🟢 Low - Peaceful observation
                    </SelectItem>
                    <SelectItem value="medium" className="text-yellow-300">
                      🟡 Medium - Caution advised
                    </SelectItem>
                    <SelectItem value="high" className="text-red-300">
                      🔴 High - Immediate danger
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  disabled={!formData.type || !formData.species || !formData.reporterId || !!locationError}
                >
                  Submit Sighting
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
