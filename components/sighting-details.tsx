"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Clock, User, Shield, CheckCircle, AlertTriangle } from "lucide-react"
import type { Sighting, User as UserType } from "@/types/wildlife"

interface SightingDetailsProps {
  sighting: Sighting
  user?: UserType
  onClose: () => void
  onUserClick: (userId: string) => void
}

export function SightingDetails({ sighting, user, onClose, onUserClick }: SightingDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  const { date, time } = formatDate(sighting.timestamp)

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "medium":
        return "border-orange-500 text-orange-400 bg-orange-500/10"
      case "low":
        return "border-green-500 text-green-400 bg-green-500/10"
      default:
        return "border-gray-500 text-gray-400 bg-gray-500/10"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bear":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "wolf":
        return "border-orange-500 text-orange-400 bg-orange-500/10"
      case "rare":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "deer":
        return "border-green-500 text-green-400 bg-green-500/10"
      case "eagle":
        return "border-blue-500 text-blue-400 bg-blue-500/10"
      default:
        return "border-purple-500 text-purple-400 bg-purple-500/10"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-black/80 border-purple-500/20 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-white mb-2">{sighting.species}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getTypeColor(sighting.type)}>
                {sighting.type.charAt(0).toUpperCase() + sighting.type.slice(1)}
              </Badge>
              <Badge variant="outline" className={getThreatColor(sighting.threatLevel)}>
                {sighting.threatLevel.charAt(0).toUpperCase() + sighting.threatLevel.slice(1)} Threat
              </Badge>
              {sighting.verified && (
                <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-300">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Location</span>
              </div>
              <div className="text-white font-mono text-sm bg-white/5 p-3 rounded-lg">
                <div>Lat: {sighting.coordinates.lat.toFixed(6)}°</div>
                <div>Lng: {sighting.coordinates.lng.toFixed(6)}°</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-300">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Timestamp</span>
              </div>
              <div className="text-white text-sm bg-white/5 p-3 rounded-lg">
                <div>{date}</div>
                <div>{time}</div>
              </div>
            </div>
          </div>

          {/* Reporter Info */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-300">
                <User className="w-4 h-4" />
                <span className="font-medium">Reported by</span>
              </div>
              <div
                className="bg-white/5 p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onUserClick(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{user.avatar}</div>
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-purple-300 text-sm">@{user.username}</div>
                    <div className="text-gray-400 text-xs">{user.sightingsCount} sightings</div>
                  </div>
                  {user.verified && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-300">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Description</span>
            </div>
            <div className="text-white bg-white/5 p-4 rounded-lg">
              {sighting.description || "No description provided."}
            </div>
          </div>

          {/* Threat Assessment */}
          {sighting.threatLevel === "high" && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">High Threat Warning</span>
              </div>
              <p className="text-red-300 text-sm">
                This sighting has been marked as high threat. Exercise extreme caution in this area and consider
                avoiding it until further notice.
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-purple-300 mb-1">Sighting ID</div>
              <div className="text-white font-mono">{sighting.id}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-purple-300 mb-1">Status</div>
              <div className="text-white">{sighting.verified ? "Verified" : "Pending Verification"}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                const coords = `${sighting.coordinates.lat},${sighting.coordinates.lng}`
                const url = `https://www.google.com/maps?q=${coords}`
                window.open(url, "_blank")
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
