import Address from '~/models/address.model'
const addAddress = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { fullName, phone, city, district, ward, detailAddress, typeAddress, isDefault } = req.body

        // Kiểm tra xem user đã có địa chỉ chưa
        const addressCount = await Address.countDocuments({ user: req.user.id })

        let finalIsDefault = isDefault

        if (addressCount === 0) {
            // Nếu là địa chỉ đầu tiên, luôn đặt isDefault = true
            finalIsDefault = true
        } else if (isDefault) {
            // Nếu không phải lần đầu mà isDefault được chọn, bỏ default của địa chỉ cũ
            await Address.findOneAndUpdate(
                { user: req.user.id, isDefault: true },
                { $set: { isDefault: false } },
                { new: true },
            )
        }

        const address = new Address({
            user: req.user.id,
            fullName,
            phone,
            city,
            district,
            ward,
            detailAddress,
            typeAddress,
            isDefault: finalIsDefault,
        })

        await address.save()
        res.status(200).json({ message: 'Tạo địa chỉ thành công', status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

const getAddress = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1 })

        res.status(200).json({ message: 'Lấy thành công', addresses, status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

const getAddressById = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const addressId = req.params.id

        const address = await Address.find({ _id: addressId })

        res.status(200).json({ message: 'Lấy thành công', address, status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

const setDefaultAddress = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const addressId = req.params.id

        // Tắt isDefault của tất cả địa chỉ thuộc user trước khi đặt mới
        await Address.updateMany({ user: req.user.id }, { $set: { isDefault: false } })

        // Đặt địa chỉ mới thành mặc định
        const newDefaultAddress = await Address.findOneAndUpdate(
            { _id: addressId, user: req.user.id }, // Đảm bảo địa chỉ thuộc về user
            { $set: { isDefault: true } },
            { new: true },
        )

        if (!newDefaultAddress) {
            return res.status(404).json({ message: 'Địa chỉ không tồn tại', status: 404 })
        }

        res.status(200).json({ message: 'Cập nhật thành công', status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

const updateAddressById = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { fullName, phone, city, district, ward, detailAddress, typeAddress, isDefault } = req.body

        if (isDefault) {
            await Address.findOneAndUpdate(
                { user: req.user.id, isDefault: true },
                {
                    $set: {
                        isDefault: false,
                    },
                },
                { new: true }, // Trả về bản ghi sau khi cập nhật
            )
        }

        const updateAddress = await Address.findByIdAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    fullName,
                    phone,
                    city,
                    district,
                    ward,
                    detailAddress,
                    typeAddress: typeAddress,
                    isDefault,
                },
            },
            { new: true },
        )

        await updateAddress.save()
        res.status(200).json({ message: 'Cập nhật địa chỉ thành công', status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

const deleteAddressById = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const addressId = req.params.id

        const delAddress = await Address.findByIdAndDelete({ _id: addressId })

        if (!delAddress) {
            return res.status(404).json({ message: 'Địa chỉ không tồn tại', status: 404 })
        }

        res.status(200).json({ message: 'Xóa thành công', status: 200 })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}

module.exports = {
    addAddress,
    getAddress,
    getAddressById,
    setDefaultAddress,
    updateAddressById,
    deleteAddressById,
}
