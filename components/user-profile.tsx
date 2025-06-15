"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, User, MapPin, CheckCircle, TrendingUp } from "lucide-react"
import type { Sighting, User as UserType } from "@/types/wildlife"

interface UserProfileProps {
  user: UserType
  sightings: Sighting[]
  onClose: () => void
  onSightingClick: (sighting: Sighting) => void
}

export function UserProfile({ user, sightings, onClose, onSightingClick }: UserProfileProps) {
  const recentSightings = sightings.slice(0, 5)

  const sightingsByType = sightings.reduce(
    (acc, sighting) => {
      acc[sighting.type] = (acc[sighting.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const verifiedSightings = sightings.filter((s) => s.verified).length
  const verificationRate = sightings.length > 0 ? ((verifiedSightings / sightings.length) * 100).toFixed(1) : "0"

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bear":
        return "🐻"
      case "wolf":
        return "🐺"
      case "deer":
        return "🦌"
      case "eagle":
        return "🦅"
      case "rare":
        return "🦁"
      default:
        return "🐾"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-black/80 border-purple-500/20 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{user.avatar}</div>
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                {user.name}
                {user.verified && <CheckCircle className="w-5 h-5 text-green-400" />}
              </CardTitle>
              <p className="text-purple-300">@{user.username}</p>
              <p className="text-gray-400 text-sm mt-1">{user.bio}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-cyan-400">{user.sightingsCount}</div>
              <div className="text-sm text-purple-300">Total Sightings</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{verifiedSightings}</div>
              <div className="text-sm text-purple-300">Verified</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">{verificationRate}%</div>
              <div className="text-sm text-purple-300">Accuracy</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">{formatDate(user.joinDate)}</div>
              <div className="text-sm text-purple-300">Member Since</div>
            </div>
          </div>

          {/* Sighting Types */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Sighting Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(sightingsByType).map(([type, count]) => (
                <div key={type} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <span className="text-white font-medium capitalize">{type}</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sightings */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Recent Sightings
            </h3>
            <div className="space-y-3">
              {recentSightings.map((sighting) => (
                <div
                  key={sighting.id}
                  className="bg-white/5 p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => onSightingClick(sighting)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(sighting.type)}</span>
                      <span className="text-white font-medium">{sighting.species}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sighting.verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                      <Badge
                        variant="outline"
                        className={`
                          ${sighting.threatLevel === "high" ? "border-red-500 text-red-400" : ""}
                          ${sighting.threatLevel === "medium" ? "border-orange-500 text-orange-400" : ""}
                          ${sighting.threatLevel === "low" ? "border-green-500 text-green-400" : ""}
                        `}
                      >
                        {sighting.threatLevel}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{sighting.description}</p>
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span>{formatDate(sighting.timestamp)}</span>
                    <span>
                      {sighting.coordinates.lat.toFixed(4)}°, {sighting.coordinates.lng.toFixed(4)}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-300 mb-3">
              <User className="w-4 h-4" />
              <span className="font-medium">Profile Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-purple-300 mb-1">Join Date</div>
                <div className="text-white">{formatDate(user.joinDate)}</div>
              </div>
              <div>
                <div className="text-purple-300 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <span className="text-white">{user.verified ? "Verified Reporter" : "Standard User"}</span>
                  {user.verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
            >
              Close Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
