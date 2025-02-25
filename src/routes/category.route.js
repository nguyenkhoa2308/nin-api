import express from 'express'

const router = express.Router()
const {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    deleteCategory,
    updateCategory,
} = require('../controllers/category.controller')

router.get('/', getCategories)
router.get('/id/:id', getCategoryById)
router.get('/:slug', getCategoryBySlug)
router.post('/add', createCategory)
router.delete('/:id', deleteCategory)
router.put('/:id', updateCategory)

module.exports = router
