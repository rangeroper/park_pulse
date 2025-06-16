import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Sighting } from "../../../types/wildlife"

const dataFilePath = path.join(process.cwd(), "data", "sightings.json")

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read sightings from JSON file
async function readSightings(): Promise<Sighting[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(dataFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.log("No existing sightings file, creating new one")
    // Return default data if file doesn't exist
    const defaultSightings: Sighting[] = [
      {
        id: "1",
        type: "bear",
        species: "Grizzly Bear",
        coordinates: { lat: 44.428, lng: -110.5885 },
        timestamp: new Date().toISOString(),
        reporterId: "user1",
        description: "Large grizzly bear spotted near hiking trail",
        threatLevel: "high",
        verified: true,
        images: [],
      },
      {
        id: "2",
        type: "wolf",
        species: "Gray Wolf",
        coordinates: { lat: 44.5994, lng: -110.5472 },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reporterId: "user2",
        description: "Pack of 3 wolves observed hunting",
        threatLevel: "medium",
        verified: true,
        images: [],
      },
      {
        id: "3",
        type: "rare",
        species: "Canada Lynx",
        coordinates: { lat: 44.7291, lng: -110.0584 },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        reporterId: "user3",
        description: "Rare Canada Lynx sighting in daylight",
        threatLevel: "high",
        verified: false,
        images: [],
      },
      {
        id: "4",
        type: "bison",
        species: "American Bison",
        coordinates: { lat: 44.8652, lng: -110.6808 },
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        reporterId: "user1",
        description: "Large herd of bison grazing in Lamar Valley",
        threatLevel: "low",
        verified: true,
        images: [],
      },
      {
        id: "5",
        type: "bison",
        species: "American Bison",
        coordinates: { lat: 44.628, lng: -110.2885 },
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        reporterId: "user2",
        description: "Bison spotted near the river.",
        threatLevel: "low",
        verified: true,
        images: [],
      },
    ]
    await writeSightings(defaultSightings)
    return defaultSightings
  }
}

// Write sightings to JSON file
async function writeSightings(sightings: Sighting[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(dataFilePath, JSON.stringify(sightings, null, 2), "utf8")
}

export async function GET() {
  try {
    const sightings = await readSightings()
    return NextResponse.json(sightings)
  } catch (error) {
    console.error("Error reading sightings:", error)
    return NextResponse.json({ error: "Failed to read sightings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSighting: Sighting = await request.json()
    const sightings = await readSightings()

    // Add the new sighting to the beginning of the array
    sightings.unshift(newSighting)

    // Write back to file
    await writeSightings(sightings)

    return NextResponse.json(newSighting, { status: 201 })
  } catch (error) {
    console.error("Error creating sighting:", error)
    return NextResponse.json({ error: "Failed to create sighting" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedSighting: Sighting = await request.json()
    const sightings = await readSightings()

    // Find and update the sighting
    const index = sightings.findIndex((s) => s.id === updatedSighting.id)
    if (index !== -1) {
      sightings[index] = updatedSighting
      await writeSightings(sightings)
      return NextResponse.json(updatedSighting)
    } else {
      return NextResponse.json({ error: "Sighting not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating sighting:", error)
    return NextResponse.json({ error: "Failed to update sighting" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Sighting ID required" }, { status: 400 })
    }

    const sightings = await readSightings()
    const filteredSightings = sightings.filter((s) => s.id !== id)

    if (filteredSightings.length === sightings.length) {
      return NextResponse.json({ error: "Sighting not found" }, { status: 404 })
    }

    await writeSightings(filteredSightings)
    return NextResponse.json({ message: "Sighting deleted successfully" })
  } catch (error) {
    console.error("Error deleting sighting:", error)
    return NextResponse.json({ error: "Failed to delete sighting" }, { status: 500 })
  }
}
