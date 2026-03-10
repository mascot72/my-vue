import express from 'express'
import { getRootNodes, getChildNodes, getNodeById } from '../data/treeData.js'

const router = express.Router()

/**
 * GET /api/tree/roots
 * 루트 노드 조회 (Level 1)
 */
router.get('/roots', (req, res) => {
  setTimeout(() => {
    const roots = getRootNodes()
    res.json(roots)
  }, 500) // Mock delay
})

/**
 * GET /api/tree/:nodeId/children
 * 특정 부모의 자식 노드 조회
 */
router.get('/:nodeId/children', (req, res) => {
  const { nodeId } = req.params

  setTimeout(() => {
    const children = getChildNodes(nodeId)
    res.json(children)
  }, 300) // Mock delay
})

/**
 * GET /api/tree/:nodeId
 * 특정 노드 정보 조회
 */
router.get('/:nodeId', (req, res) => {
  const { nodeId } = req.params

  setTimeout(() => {
    const node = getNodeById(nodeId)
    if (node) {
      res.json(node)
    } else {
      res.status(404).json({ error: 'Node not found' })
    }
  }, 200) // Mock delay
})

export default router
