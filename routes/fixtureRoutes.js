// routes/fixtureRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerFixture } = require('../controllers/fixtureController');

// GET /api/fixture
router.get('/', obtenerFixture);

module.exports = router;