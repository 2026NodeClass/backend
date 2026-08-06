const express = require('express');
const {
  getFavorites,
  createFavorite,
  deleteFavorite,
} = require('../controllers/favorite.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken);
router.get('/', getFavorites);
router.post('/:planetId', createFavorite);
router.delete('/:planetId', deleteFavorite);

module.exports = router;
