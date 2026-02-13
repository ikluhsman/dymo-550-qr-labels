import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDB } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Serve built frontend
app.use(express.static(path.join(__dirname, 'public')))

const db = await initDB()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/allocate-batch', async (req, res) => {
  try {
    const { prefix, count } = req.body

    const row = await db.get(
      `SELECT MAX(number) as max FROM labels WHERE prefix = ?`,
      prefix
    )

    let next = (row?.max ?? 0) + 1
    const codes = []

    await db.exec('BEGIN TRANSACTION')

    for (let i = 0; i < count; i++) {
      const padded = String(next).padStart(6, '0')
      const code = `${prefix}-${padded}`

      await db.run(
        `INSERT INTO labels (prefix, number, code, printed_at)
         VALUES (?, ?, ?, datetime('now'))`,
        prefix,
        next,
        code
      )

      codes.push(code)
      next++
    }

    await db.exec('COMMIT')

    res.json({ codes })
  } catch (err) {
    await db.exec('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Batch allocation failed' })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(4000, () =>
  console.log('Server running on port 4000')
)
