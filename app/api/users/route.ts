import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { User } from "@/types/wildlife"

const dataFilePath = path.join(process.cwd(), "data", "users.json")

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read users from JSON file
async function readUsers(): Promise<User[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(dataFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.log("No existing users file, creating new one")
    // Return default data if file doesn't exist
    const defaultUsers: User[] = [
      {
        id: "user1",
        name: "Sarah Johnson",
        username: "wildlifewatcher",
        avatar: "🧑‍🔬",
        joinDate: "2024-01-15",
        sightingsCount: 23,
        verified: true,
        bio: "Wildlife biologist and nature enthusiast",
      },
      {
        id: "user2",
        name: "Mike Chen",
        username: "trailrunner",
        avatar: "🏃‍♂️",
        joinDate: "2024-02-20",
        sightingsCount: 15,
        verified: true,
        bio: "Trail runner and outdoor photographer",
      },
      {
        id: "user3",
        name: "Emma Davis",
        username: "naturelover",
        avatar: "🌲",
        joinDate: "2024-03-10",
        sightingsCount: 8,
        verified: false,
        bio: "Hiking enthusiast and wildlife observer",
      },
      {
        id: "user4",
        name: "Alex Rivera",
        username: "mountainguide",
        avatar: "🏔️",
        joinDate: "2024-01-05",
        sightingsCount: 31,
        verified: true,
        bio: "Professional mountain guide and wildlife tracker",
      },
      {
        id: "user5",
        name: "Jordan Park",
        username: "forestexplorer",
        avatar: "🌿",
        joinDate: "2024-02-28",
        sightingsCount: 12,
        verified: false,
        bio: "Forest conservation volunteer and amateur photographer",
      },
    ]
    await writeUsers(defaultUsers)
    return defaultUsers
  }
}

// Write users to JSON file
async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8")
}

export async function GET() {
  try {
    const users = await readUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error reading users:", error)
    return NextResponse.json({ error: "Failed to read users" }, { status: 500 })
  }
}
