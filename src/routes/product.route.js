import express from 'express'

const router = express.Router()

const {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    getAllBrands,
} = require('~/controllers/product.controller')

router.get('/', getProducts)
router.get('/brands', getAllBrands)
router.get('/id/:id', getProductById)
router.get('/:slug', getProductBySlug)
router.post('/create', createProduct)

module.exports = router
