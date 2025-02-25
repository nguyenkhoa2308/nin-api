const express = require('express')
const router = express.Router()
import { auth } from '~/middlewares/auth'
import {
    addAddress,
    getAddress,
    // getAddressById,
    setDefaultAddress,
    updateAddressById,
    deleteAddressById,
} from '~/controllers/address.controller'

router.get('/', auth, getAddress)
// router.get('/:id', auth, getAddressById)
router.post('/add', auth, addAddress)
router.post('/set-default/:id', auth, setDefaultAddress)
router.put('/update/:id', auth, updateAddressById)
router.delete('/delete/:id', auth, deleteAddressById)

module.exports = router
