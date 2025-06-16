"use client"

import { useState, useEffect } from "react"
import { IsometricYellowstoneMap } from "../components/isometric-yellowstone-map"
import { YellowstoneSightingForm } from "../components/yellowstone-sighting-form"
import { UserProfile } from "../components/user-profile"
import { SightingDetails } from "../components/sighting-details"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { MapPin, Plus, TrendingUp, Shield, RefreshCw, Search, Filter, Bell, Download, Share2 } from "lucide-react"
import type { Sighting, User } from "../types/wildlife"

export default function WildlifeTracker() {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [hoveredSighting, setHoveredSighting] = useState<string | null>(null) // New state for hover
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterThreat, setFilterThreat] = useState("all")
  const [stats, setStats] = useState({
    totalSightings: 0,
    activeThreat: 0,
    rareSpecies: 0,
    activeUsers: 0,
  })

  // Load initial data and set up real-time updates
  useEffect(() => {
    loadData()

    // Set up periodic refresh to get new data
    const interval = setInterval(() => {
      loadData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load sightings
      const sightingsResponse = await fetch("/api/sightings", {
        cache: "no-store", // Ensure we get fresh data
      })
      if (sightingsResponse.ok) {
        const sightingsData = await sightingsResponse.json()
        setSightings(sightingsData)
      }

      // Load users
      const usersResponse = await fetch("/api/users", {
        cache: "no-store",
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSighting = async (sighting: Omit<Sighting, "id" | "timestamp">) => {
    const newSighting: Sighting = {
      ...sighting,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSighting),
      })

      if (response.ok) {
        // Reload data to get the updated list
        await loadData()
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error adding sighting:", error)
      // Show error message to user
      alert("Failed to add sighting. Please try again.")
    }
  }

  // Filter sightings based on search and filters
  const filteredSightings = sightings.filter((sighting) => {
    const matchesSearch =
      sighting.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sighting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users
        .find((u) => u.id === sighting.reporterId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || sighting.type === filterType
    const matchesThreat = filterThreat === "all" || sighting.threatLevel === filterThreat

    return matchesSearch && matchesType && matchesThreat
  })

  // Update stats when sightings change
  useEffect(() => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    setStats({
      totalSightings: sightings.length,
      activeThreat: sightings.filter((s) => s.threatLevel === "high" && new Date(s.timestamp).getTime() > oneDayAgo)
        .length,
      rareSpecies: sightings.filter((s) => s.type === "rare").length,
      activeUsers: new Set(sightings.map((s) => s.reporterId)).size,
    })
  }, [sightings])

  const handleMarkerClick = (sighting: Sighting) => {
    setSelectedSighting(sighting)
    setSelectedUser(null)
    setHoveredSighting(null) // Clear hover when clicking
  }

  const handleUserClick = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setSelectedSighting(null)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredSightings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `yellowstone-sightings-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Yellowstone Wildlife Sightings",
          text: `Check out these ${filteredSightings.length} wildlife sightings in Yellowstone!`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  // Get recent high-threat sightings
  const activeThreatSightings = sightings
    .filter((s) => s.threatLevel === "high" && new Date(s.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">YellowstoneWatch</h1>
                <p className="text-purple-300 text-sm">3D Wildlife Tracking System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{stats.totalSightings}</div>
                  <div className="text-xs text-purple-300">Total Sightings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.activeThreat}</div>
                  <div className="text-xs text-purple-300">Active Threats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.rareSpecies}</div>
                  <div className="text-xs text-purple-300">Rare Species</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
                  <div className="text-xs text-purple-300">Active Users</div>
                </div>
              </div>

              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Sighting
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl overflow-hidden">
              <IsometricYellowstoneMap
                sightings={filteredSightings}
                onMarkerClick={handleMarkerClick}
                selectedSighting={selectedSighting}
                hoveredSighting={hoveredSighting} // Pass hover state to map
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  Search & Filter
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      placeholder="Search sightings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-purple-500/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="bg-white/5 border-purple-500/20 text-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/20">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="bear">Bears</SelectItem>
                        <SelectItem value="wolf">Wolves</SelectItem>
                        <SelectItem value="bison">Bison</SelectItem>
                        <SelectItem value="elk">Elk</SelectItem>
                        <SelectItem value="eagle">Eagles</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterThreat} onValueChange={setFilterThreat}>
                      <SelectTrigger className="bg-white/5 border-purple-500/20 text-white">
                        <SelectValue placeholder="Threat" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/20">
                        <SelectItem value="all">All Threats</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={handleShareData}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Sightings */}
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Recent Sightings ({filteredSightings.length})
                  {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSightings.slice(0, 10).map((sighting) => {
                    const user = users.find((u) => u.id === sighting.reporterId)
                    const isHovered = hoveredSighting === sighting.id
                    return (
                      <div
                        key={sighting.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isHovered
                            ? "bg-purple-500/20 border-purple-400/50 scale-105 shadow-lg"
                            : "bg-white/5 border-purple-500/10 hover:bg-white/10"
                        }`}
                        onClick={() => handleMarkerClick(sighting)}
                        onMouseEnter={() => setHoveredSighting(sighting.id)}
                        onMouseLeave={() => setHoveredSighting(null)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={`
                              ${sighting.type === "bear" ? "border-red-500 text-red-400" : ""}
                              ${sighting.type === "wolf" ? "border-orange-500 text-orange-400" : ""}
                              ${sighting.type === "rare" ? "border-yellow-500 text-yellow-400" : ""}
                              ${sighting.type === "elk" ? "border-green-500 text-green-400" : ""}
                              ${sighting.type === "eagle" ? "border-blue-500 text-blue-400" : ""}
                              ${sighting.type === "bison" ? "border-amber-500 text-amber-400" : ""}
                            `}
                          >
                            {sighting.species}
                          </Badge>
                          <span className="text-xs text-purple-300">
                            {new Date(sighting.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{sighting.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className="text-cyan-400 cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserClick(sighting.reporterId)
                            }}
                          >
                            by {user?.name || "Unknown"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`
                              ${sighting.threatLevel === "high" ? "border-red-500 text-red-400" : ""}
                              ${sighting.threatLevel === "medium" ? "border-orange-500 text-orange-400" : ""}
                              ${sighting.threatLevel === "low" ? "border-green-500 text-green-400" : ""}
                            `}
                          >
                            {sighting.threatLevel} threat
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Active Threats */}
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Active Threats ({activeThreatSightings.length})
                </h3>
                <div className="space-y-2">
                  {activeThreatSightings.map((sighting) => {
                    const isHovered = hoveredSighting === sighting.id
                    return (
                      <div
                        key={sighting.id}
                        className={`p-2 rounded border cursor-pointer transition-all duration-200 ${
                          isHovered
                            ? "bg-red-500/30 border-red-400/70 scale-105 shadow-lg animate-pulse"
                            : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                        }`}
                        onClick={() => handleMarkerClick(sighting)}
                        onMouseEnter={() => setHoveredSighting(sighting.id)}
                        onMouseLeave={() => setHoveredSighting(null)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-red-400 font-medium text-sm">{sighting.species}</span>
                          <span className="text-xs text-red-300">
                            {new Date(sighting.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">{sighting.description}</p>
                      </div>
                    )
                  })}
                  {activeThreatSightings.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-green-400 text-sm">No active threats in the last 24 hours</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && <YellowstoneSightingForm users={users} onSubmit={addSighting} onClose={() => setShowForm(false)} />}

      {selectedSighting && (
        <SightingDetails
          sighting={selectedSighting}
          user={users.find((u) => u.id === selectedSighting.reporterId)}
          onClose={() => setSelectedSighting(null)}
          onUserClick={handleUserClick}
        />
      )}

      {selectedUser && (
        <UserProfile
          user={selectedUser}
          sightings={sightings.filter((s) => s.reporterId === selectedUser.id)}
          onClose={() => setSelectedUser(null)}
          onSightingClick={handleMarkerClick}
        />
      )}
    </div>
  )
}
