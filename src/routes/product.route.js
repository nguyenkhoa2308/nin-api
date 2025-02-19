import express from 'express'

const router = express.Router()

const {
    getProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    createProduct,
    getAllBrands,
    searchProduct,
} = require('~/controllers/product.controller')

router.get('/search', searchProduct)
router.get('/', getProducts)
router.get('/brands', getAllBrands)
router.get('/id/:id', getProductById)
router.get('/:slug', getProductBySlug)
router.get('/category/:categorySlug', getProductsByCategory)

router.post('/create', createProduct)

module.exports = router
