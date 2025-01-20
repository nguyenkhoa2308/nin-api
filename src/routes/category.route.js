import express from 'express'

const router = express.Router()
const {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory
} = require('../controllers/category.controller')

router.get('/', getCategories)
router.get('/id/:id', getCategoryById)
router.get('/:slug', getCategoryBySlug)
router.post('/create', createCategory)

module.exports = router
