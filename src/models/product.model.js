const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

mongoose.plugin(slug)

const ProductSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        image: { type: [String], required: true },
        priceOriginal: { type: Number, required: true },
        priceFinal: { type: Number, required: false },
        stock: { type: Number, required: true },
        variant: [
            {
                name: { type: String, required: true },
                images: [
                    {
                        type: String,
                        required: true,
                    },
                ],
            },
        ],
        description: { type: String, required: false },
        slug: { type: String, slug: 'name' },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

ProductSchema.index({ name: 'text', description: 'text' })

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
