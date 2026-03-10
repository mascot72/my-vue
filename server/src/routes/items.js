import express from 'express'
import { getItemsByGroupId, getAllItems, getItemById } from '../data/itemsData.js'

const router = express.Router()

/**
 * GET /api/items/all
 * 모든 아이템 조회
 */
router.get('/all', (req, res) => {
  setTimeout(() => {
    const items = getAllItems()
    res.json(items)
  }, 800) // Mock delay
})

/**
 * GET /api/items/group/:groupId
 * 특정 그룹의 아이템들 조회
 */
router.get('/group/:groupId', (req, res) => {
  const { groupId } = req.params

  setTimeout(() => {
    const items = getItemsByGroupId(groupId)
    res.json(items)
  }, 800) // Mock delay
})

/**
 * GET /api/items/:itemId
 * 특정 아이템 상세 정보 조회
 */
router.get('/:itemId', (req, res) => {
  const { itemId } = req.params

  setTimeout(() => {
    const item = getItemById(itemId)
    if (item) {
      res.json(item)
    } else {
      res.status(404).json({ error: 'Item not found' })
    }
  }, 300) // Mock delay
})

export default router
