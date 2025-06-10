'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function WeatherApp() {
  const [method, setMethod] = useState('zip')
  const [input, setInput] = useState('')
  const [from, setFrom] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [_id, setId] = useState('');

const loadEntries = async () => {
    const res = await fetch('/api')
    const result = await res.json()
    setEntries(result)
  }
  useEffect(() => { loadEntries() }, [])

const createEntry = async () => {
    setLoading(true)
    if(edit) {
      const res = await fetch('/api', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ _id, method, input, from})
            })
            const data = await res.json()
            setLoading(false)
            setEdit(false)
            if (!data.error) loadEntries()
    }else {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, input, from})
      })
      const data = await res.json()
      setLoading(false)
      if (!data.error) loadEntries()
      }
  }

const deleteEntry = async (id: string) => {
    await fetch(`/api?id=${id}`, { method: 'DELETE' })
    loadEntries()
  }

const editEntry = async (e) => {
  alert("The info is filled in input fields edit the field and click save")
  setEdit(true)
  setId(e._id)
  setMethod(e.method)
  setInput(e.location)
  setFrom(e.from)
}

  return (
    <div>
      <h1>Weather CRUD App</h1>
      <div>
        <select value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="zip">Zip</option>
          <option value="gps">GPS</option>
          <option value="town">Town</option>
          <option value="city">City</option>
        </select>
        <input placeholder="Location" value={input} onChange={e=>setInput(e.target.value)} />
        <input type="number" value={from} onChange={e=>setFrom(e.target.value)} />
        <button onClick={createEntry}>Save</button>
      </div>
      {loading && <p>Saving...</p>}
      <div>
        {entries.map(e => (
          <div key={e._id} >
            <div >
              <fieldset>
                <legend><strong>{e.location}</strong> ({e.from})</legend>
                <ul>
                  {e.forecast.map((d:any)=> (
                    <li key={d.date}>
                      <p>{d.date}</p>
                      <Image src={`https:${d.day.condition.icon}`} alt="icon" width={48} height={48} />
                      <p>{d.day.maxtemp_c}/{d.day.mintemp_c}°C</p>
                    </li>
                  ))}
                </ul>
              </fieldset>
              <button onClick={()=>deleteEntry(e._id)}>Delete</button>
              <button onClick={()=>editEntry(e)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
