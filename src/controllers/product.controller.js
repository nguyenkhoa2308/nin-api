/* eslint-disable indent */
const Product = require('~/models/product.model')
// const removeAccents = require('remove-accents')
const slugify = require('slugify')
const Category = require('~/models/category.model')
// const { populate } = require('dotenv')
// const { patch } = require('../routes/product.route')

// const searchBooks = async (req, res) => {
//     const search = req.query.search || ''
//     const category = req.query.category || ''
//     const page = parseInt(req.query.page) || 1
//     const limit = parseInt(req.query.limit) || 12
//     const sortBy = req.query.sortBy || 'sold'
//     const orderBy = req.query.orderBy === 'desc' ? -1 : 1
//     const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null
//     const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null
//     try {
//         let querySearch = {}
//         if (search) {
//             querySearch = { $text: { $search: search } }
//         }
//         if (category) {
//             const categoryModel = await Category.findOne({ slug: category })
//             if (categoryModel) {
//                 querySearch['categories'] = categoryModel._id
//             } else {
//                 res.status(404).json({ message: 'Không tìm thấy danh mục' })
//             }
//         }
//         querySearch['status'] = { $in: [StatusBook.SELLING, StatusBook.STOP_IMPORT] }
//         if (minPrice !== null) {
//             querySearch.priceFinal = { $gte: minPrice }
//         }
//         if (maxPrice !== null) {
//             querySearch.priceFinal = querySearch.priceFinal
//                 ? { ...querySearch.priceFinal, $lte: maxPrice }
//                 : { $lte: maxPrice }
//         }
//         const books = await Book.find(querySearch)
//             .select('_id slug name avatar priceOriginal priceFinal status')
//             .populate('categories')
//             .sort({ [sortBy]: orderBy })
//             .skip((page - 1) * limit)
//             .limit(limit)

//         const totalCount = await Book.countDocuments(querySearch)
//         const totalPages = Math.ceil(totalCount / limit)
//         res.status(200).json({
//             currentPage: page,
//             totalPages: totalPages,
//             totalCount: totalCount,
//             pageSize: books.length,
//             books: books,
//         })
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// }

const getProducts = async (req, res) => {
    try {
        const product = await Product.find().populate('category')
        if (product) {
            res.status(200).json(product)
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getProductsByCategory = async (req, res) => {
    try {
        const { categorySlug } = req.params

        const { brand, priceRanges, sortBy } = req.query

        let sortOptions = {}

        switch (sortBy) {
            case 'price_asc':
                sortOptions.priceFinal = 1 // Giá tăng dần
                break
            case 'price_desc':
                sortOptions.priceFinal = -1 // Giá giảm dần
                break
            case 'name_asc':
                sortOptions.slug = 1 // Tên từ A-Z
                break
            case 'name_desc':
                sortOptions.slug = -1 // Tên từ Z-A
                break
            case 'newest':
                sortOptions.createdAt = -1 // Mới nhất (sắp xếp theo thời gian)
                break
            case 'oldest':
                sortOptions.createdAt = 1 // Cũ nhất
                break
            default:
                break
        }
        // Tìm category theo slug
        const category = await Category.findOne({ slug: categorySlug })

        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' })
        }

        let filter = { category: category._id }

        if (brand) {
            const brandArray = Array.isArray(brand) ? brand : [brand]
            filter.brand = { $in: brandArray }
        }

        if (priceRanges) {
            const rangesArray = Array.isArray(priceRanges) ? priceRanges : [priceRanges]

            const priceConditions = rangesArray.map((range) => {
                if (range === '<1000000') {
                    return { priceFinal: { $lt: 1000 } }
                } else if (range === '>4000000') {
                    return { priceFinal: { $gt: 4000 } }
                } else {
                    const [min, max] = range.split('-').map(Number)
                    return { priceFinal: { $gte: min / 1000, $lte: max / 1000 } }
                }
            })

            filter.$or = priceConditions
        }

        // Lấy sản phẩm theo categoryId
        const products = await Product.find(filter).populate('category').sort(sortOptions)

        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error })
    }
}

const getProductById = async (req, res) => {
    const id = req.params.id
    try {
        const product = await Product.findOne({ _id: id }).populate('category')
        if (product) {
            res.status(200).json(product)
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getProductBySlug = async (req, res) => {
    const slug = req.params.slug
    try {
        const product = await Product.findOne({ slug: slug }).populate('category').lean()
        // .populate('author', '_id slug fullName avatar')
        // .populate({
        //     path: 'reviews',
        //     populate: {
        //         path: 'user',
        //     },
        // })
        if (product) {
            res.status(200).json(product)
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getAllBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand') // Lấy danh sách brand duy nhất
        res.status(200).json(brands)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// const getBookByAuthor = async (req, res) => {
//     const slug = req.params.slug
//     try {
//         const author = await Author.findOne({ slug: slug })
//         if (author) {
//             const books = await Book.find({ author: author._id })
//             res.status(200).json(books)
//         } else {
//             res.status(404).json({ message: 'Không tìm thấy sách' })
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// }

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateProductById = async (req, res) => {
    const id = req.params.id
    try {
        const product = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true })
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        } else {
            res.status(200).json(product)
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// const addReviewBook = async (req, res) => {
//     try {
//         if (req.user.userId) {
//             const slug = req.params.slug
//             const content = req.body.content
//             const rating = req.body.rating
//             const book = await Book.findOne({ slug: slug }).populate('reviews')
//             if (!book) {
//                 return res.status(404).json('Không tìm thấy thông sách')
//             }
//             const review = new Review({
//                 content: content,
//                 rating: rating,
//                 user: req.user.userId,
//             })
//             await review.save()
//             book.reviews.push(review)
//             await book.save()
//             return res.status(200).json('Thêm review thành công')
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message })
//     }
// }

const searchProduct = async (req, res) => {
    try {
        const query = req.query.q
        // const normalizedQuery = removeAccents(query)
        const normalizedQuery = slugify(query, { lower: true, locale: 'vi' })

        const products = await Product.find({
            slug: { $regex: normalizedQuery, $options: 'i' },
        }).collation({ locale: 'vi', strength: 1 })
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getProducts,
    // searchBooks,
    getProductById,
    getProductsByCategory,
    getProductBySlug,
    getAllBrands,
    // getBookByAuthor,
    createProduct,
    updateProductById,
    searchProduct,
    // addReviewBook,
}
