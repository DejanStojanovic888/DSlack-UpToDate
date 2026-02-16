const TaskController = require('../controllers/admin/TaskController.js');
const express = require('express');
const ProfileController = require("../controllers/admin/ProfileController.js");

const upload = require("../middlewares/upload.js");
const router = express.Router();

// Profile routes
router.get('/profile', ProfileController.index);
router.post('/profile/upload', upload.single('profileImage'), ProfileController.uploadImage); // .single znaci da očekujemo jedan fajl oznacen sa name="profileImage" iz inputa forme
router.post('/profile/update', ProfileController.update);


router.get('/dashboard', require('../controllers/admin/DashboardController.js'))
router.get('/task', TaskController.index)

router.get('/task/create',TaskController.create)

router.post('/task', TaskController.store)


router.delete('/task/:id', TaskController.destroy)

module.exports = router;