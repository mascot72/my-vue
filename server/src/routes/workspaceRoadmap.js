import express from 'express'
import {
  getWorkspaceRoadmapItems,
  getWorkspaceRoadmapTechs,
  getWorkspaceRoadmapTrm,
  hasWorkspaceRoadmapItem,
} from '../data/workspaceRoadmapData.js'

const router = express.Router()

const badRequest = (res, message) => {
  return res.status(400).json({
    error: true,
    message,
    code: 'INVALID_QUERY',
  })
}

const notFound = (res, itemId) => {
  return res.status(404).json({
    error: true,
    message: `Item not found: ${itemId}`,
    code: 'ITEM_NOT_FOUND',
  })
}

const validateRoadmapType = (roadmapType) => {
  if (!roadmapType) return true
  return ['PRM', 'TRM', 'COM'].includes(String(roadmapType).toUpperCase())
}

const normalizeQuery = (query) => {
  return {
    roadmapType: query.roadmapType ? String(query.roadmapType).toUpperCase() : undefined,
    includeInactive: query.includeInactive,
    page: query.page,
    size: query.size,
  }
}

/**
 * GET /api/workspace-roadmap/items
 */
router.get('/items', (req, res) => {
  const query = normalizeQuery(req.query)

  if (!validateRoadmapType(query.roadmapType)) {
    return badRequest(res, 'roadmapType must be one of PRM, TRM, COM')
  }

  setTimeout(() => {
    const pageResult = getWorkspaceRoadmapItems(query)
    res.json(pageResult)
  }, 300)
})

/**
 * GET /api/workspace-roadmap/items/:itemId/techs
 */
router.get('/items/:itemId/techs', (req, res) => {
  const { itemId } = req.params
  const query = normalizeQuery(req.query)

  if (!validateRoadmapType(query.roadmapType)) {
    return badRequest(res, 'roadmapType must be one of PRM, TRM, COM')
  }

  if (!hasWorkspaceRoadmapItem(itemId)) {
    return notFound(res, itemId)
  }

  setTimeout(() => {
    const pageResult = getWorkspaceRoadmapTechs(itemId, query)
    res.json(pageResult)
  }, 300)
})

/**
 * GET /api/workspace-roadmap/items/:itemId/trm
 */
router.get('/items/:itemId/trm', (req, res) => {
  const { itemId } = req.params
  const query = normalizeQuery(req.query)

  if (!validateRoadmapType(query.roadmapType)) {
    return badRequest(res, 'roadmapType must be one of PRM, TRM, COM')
  }

  if (!hasWorkspaceRoadmapItem(itemId)) {
    return notFound(res, itemId)
  }

  setTimeout(() => {
    const pageResult = getWorkspaceRoadmapTrm(itemId, query)
    res.json(pageResult)
  }, 300)
})

export default router
