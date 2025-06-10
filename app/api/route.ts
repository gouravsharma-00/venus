import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

import clientPromise from '@/lib/mongodb'
import { z } from 'zod'

const EntryInputSchema = z.object({
  input: z.string(),
  method: z.enum(['zip', 'gps', 'city', 'town']),
  from: z.string(),
})

export async function POST(request: Request) {
  const body = await request.json()

  // Validate input fields
  const parsed = EntryInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const { input, from } = parsed.data

  // Validate date range


  // Validate location
  const searchRes = await fetch(
    `https://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_KEY}&q=${input}`
  )
  const places = await searchRes.json()
  if (!places.length) {
    return NextResponse.json({ error: 'Location not found' }, { status: 400 })
  }

  // Fetch forecast

  const forecastRes = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${input}&days=${from}`
  )
  const weatherData = await forecastRes.json()
  const forecast = weatherData?.forecast?.forecastday || []

  // Build the entry
  const entry = {
    location: input,
    from,
    forecast,
  }

  const client = await clientPromise
  const db = client.db()
  const result = await db.collection('entries').insertOne(entry)

  return NextResponse.json({ insertedId: result.insertedId })
}

// Read all entries
export async function GET() {
  const client = await clientPromise
  const db = client.db()
  const entries = await db.collection('entries').find().toArray()
  return NextResponse.json(entries)
}

const EntrySchema = z.object({
  input: z.string(),
  method: z.string(),
  from: z.string(),
  _id: z.string()
})
// PUT handler
export async function PUT(request: Request) {
  const body = await request.json()

  const parse = EntrySchema.parse(body)
  const { _id, input, from, method } = parse


  // Validate location via WeatherAPI search
  const searchRes = await fetch(
    `https://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_KEY}&q=${input}`
  )
  const places = await searchRes.json()
  if (!places.length) {
    return NextResponse.json({ error: 'Location not found' }, { status: 400 })
  }

  // Fetch updated weather forecast
  const forecastRes = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${input}&days=${from}`
  )
  const weatherData = await forecastRes.json()

  const client = await clientPromise
  const db = client.db()

  const result = await db.collection('entries').updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: {
        input,
        method,
        from,
        forecast: weatherData.forecast.forecastday || [],
        location: places[0].name
      }
    }
  )

  return NextResponse.json({ updated: result.modifiedCount > 0 })
}

// Delete an entry
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const client = await clientPromise
  const db = client.db()
  await db.collection('entries').deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ deleted: true })
}