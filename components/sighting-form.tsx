"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { X, MapPin } from "lucide-react"
import type { Sighting, User } from "../types/wildlife"

interface SightingFormProps {
  users: User[]
  onSubmit: (sighting: Omit<Sighting, "id" | "timestamp">) => void
  onClose: () => void
}

export function SightingForm({ users, onSubmit, onClose }: SightingFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    species: "",
    coordinates: { lat: 45.5, lng: -122.3 },
    reporterId: "",
    description: "",
    threatLevel: "low" as "low" | "medium" | "high",
    verified: false,
    images: [] as string[],
  })

  const wildlifeTypes = {
    bear: ["Black Bear", "Grizzly Bear", "Brown Bear", "Polar Bear"],
    wolf: ["Gray Wolf", "Timber Wolf", "Arctic Wolf"],
    deer: ["White-tailed Deer", "Mule Deer", "Elk", "Moose"],
    eagle: ["Bald Eagle", "Golden Eagle", "Harpy Eagle"],
    rare: ["Mountain Lion", "Lynx", "Wolverine", "Snow Leopard", "Jaguar"],
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type || !formData.species || !formData.reporterId) return

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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-black/80 border-purple-500/20 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-white">Report Wildlife Sighting</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wildlife Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">
                Wildlife Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value, species: "" }))}
              >
                <SelectTrigger className="bg-white/10 border-purple-500/20 text-white">
                  <SelectValue placeholder="Select wildlife type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/20">
                  <SelectItem value="bear">🐻 Bears</SelectItem>
                  <SelectItem value="wolf">🐺 Wolves</SelectItem>
                  <SelectItem value="deer">🦌 Deer & Elk</SelectItem>
                  <SelectItem value="eagle">🦅 Birds of Prey</SelectItem>
                  <SelectItem value="rare">🦁 Rare Species</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Species */}
            {formData.type && (
              <div className="space-y-2">
                <Label htmlFor="species" className="text-white">
                  Species
                </Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, species: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-purple-500/20 text-white">
                    <SelectValue placeholder="Select specific species" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/20">
                    {wildlifeTypes[formData.type as keyof typeof wildlifeTypes]?.map((species) => (
                      <SelectItem key={species} value={species}>
                        {species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-white">Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat" className="text-sm text-gray-300">
                    Latitude
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.lat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: Number.parseFloat(e.target.value) },
                      }))
                    }
                    className="bg-white/10 border-purple-500/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lng" className="text-sm text-gray-300">
                    Longitude
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.lng}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: Number.parseFloat(e.target.value) },
                      }))
                    }
                    className="bg-white/10 border-purple-500/20 text-white"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
            </div>

            {/* Reporter */}
            <div className="space-y-2">
              <Label htmlFor="reporter" className="text-white">
                Reporter
              </Label>
              <Select
                value={formData.reporterId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, reporterId: value }))}
              >
                <SelectTrigger className="bg-white/10 border-purple-500/20 text-white">
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/20">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.avatar} {user.name} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the sighting, behavior, and any relevant details..."
                className="bg-white/10 border-purple-500/20 text-white min-h-[100px]"
              />
            </div>

            {/* Threat Level */}
            <div className="space-y-2">
              <Label htmlFor="threat" className="text-white">
                Threat Level
              </Label>
              <Select
                value={formData.threatLevel}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, threatLevel: value }))
                }
              >
                <SelectTrigger className="bg-white/10 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/20">
                  <SelectItem value="low">🟢 Low - Peaceful observation</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Caution advised</SelectItem>
                  <SelectItem value="high">🔴 High - Immediate danger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                disabled={!formData.type || !formData.species || !formData.reporterId}
              >
                Submit Sighting
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
