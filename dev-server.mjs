import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const pub = path.join(__dirname, 'public')

// Раздаём статику под тем же префиксом, что на GitHub Pages
app.use('/de-trainer', express.static(pub, { extensions: ['html'] }))

// SPA fallback для ЛЮБОГО маршрута под /de-trainer
// (Express 5 + path-to-regexp v6: используем RegExp, а не "/*")
app.get(/^\/de-trainer(?:\/.*)?$/, (_req, res) => {
  res.sendFile(path.join(pub, 'index.html'))
})

const PORT = 5173
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}/de-trainer/`)
})
