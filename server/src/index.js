import express from 'express'
import cors from 'cors'
import treeRoutes from './routes/tree.js'
import itemsRoutes from './routes/items.js'
import workspaceRoadmapRoutes from './routes/workspaceRoadmap.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/tree', treeRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/workspace-roadmap', workspaceRoadmapRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Timeline Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints:`)
  console.log(`   - Tree API: http://localhost:${PORT}/api/tree`)
  console.log(`   - Items API: http://localhost:${PORT}/api/items`)
  console.log(`   - Workspace Roadmap API: http://localhost:${PORT}/api/workspace-roadmap`)
  console.log(`   - Health: http://localhost:${PORT}/health`)
})
