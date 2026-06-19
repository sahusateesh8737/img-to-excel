const express = require('express');
const multer = require('multer');
const { processImageToExcel } = require('../controllers/convertController');

const router = express.Router();

// Configure multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

// POST /api/convert
// Expects form-data with key 'image' containing the image file
router.post('/', upload.single('image'), processImageToExcel);

module.exports = router;
