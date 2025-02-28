import express from 'express'

const router = express.Router()

const {
    getProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategoryOrRoom,
    createProduct,
    getAllBrands,
    searchProduct,
    updateProductById,
    deleteProduct,
} = require('~/controllers/product.controller')

router.get('/search', searchProduct)
router.get('/', getProducts)
router.get('/brands', getAllBrands)
router.get('/id/:id', getProductById)
router.get('/:slug', getProductBySlug)
router.get('/category/:categoryOrRoom', getProductsByCategoryOrRoom)

router.post('/add', createProduct)

router.put('/:id', updateProductById)

router.delete('/:id', deleteProduct)

module.exports = router
