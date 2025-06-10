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
              body: JSON.stringify({ _id, input, from})
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

const handleInfo = () => {
  alert(`The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.

Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.

Here are the examples of services we offer. Check out our website (link under my profile) to learn more about our services.

🚀 PMA Pro
End-to-end product manager job hunting program that helps you master FAANG-level Product Management skills, conduct unlimited mock interviews, and gain job referrals through our largest alumni network. 25% of our offers came from tier 1 companies and get paid as high as $800K/year.

🚀 AI PM Bootcamp
Gain hands-on AI Product Management skills by building a real-life AI product with a team of AI Engineers, data scientists, and designers. We will also help you launch your product with real user engagement using our 100,000+ PM community and social media channels.

🚀 PMA Power Skills
Designed for existing product managers to sharpen their product management skills, leadership skills, and executive presentation skills

🚀 PMA Leader
We help you accelerate your product management career, get promoted to Director and product executive levels, and win in the board room.

🚀 1:1 Resume Review
We help you rewrite your killer product manager resume to stand out from the crowd, with an interview guarantee.  Get started by using our FREE killer PM resume template used by over 14,000 product managers. https://www.drnancyli.com/pmresume

🚀 We also published over 500+ free training and courses. Please go to my YouTube channel https://www.youtube.com/c/drnancyli and Instagram @drnancyli to start learning for free today.`)
}
  return (
    <div>
      <h1>Gourav Sharma - Weather CRUD App, About <button onClick={handleInfo}>PM Accelerator</button> </h1>
      <div>
        <select value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="zip">Zip</option>
          <option value="gps">GPS</option>
          <option value="town">Town</option>
          <option value="city">City</option>
        </select>
        <input placeholder="Location" value={input} onChange={e=>setInput(e.target.value)} />
        <input type="number" placeholder="no of days" value={from} onChange={e=>setFrom(e.target.value)} />
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
