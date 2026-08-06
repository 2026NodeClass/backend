
//後台用API

const express = require("express");
const router = express.Router();
const {
    getGalaxies,
    createGalaxy,
    updateGalaxy,
    deleteGalaxy,
    getPlanets,
    createPlanet,
    updatePlanet,
    deletePlanet,
} = require("../controllers/admin.controller");
const {
    validateCreateGalaxy,
    checkGalaxyIdDuplicate,
    findGalaxyById,
    validateCreatePlanet,
    findPlanetById,
} = require("../middlewares/admin.middleware");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware")

//--------------------------共用 middleware (下面的所有API都會先執行這個)-------------------------------------
router.use(verifyToken); // 登入驗證
router.use(requireAdmin); // 管理員權限驗證


//--------------------------星系 API-------------------------------------

//取得所有星系
router.get("/galaxies", getGalaxies);

//新增星系(post)
router.post(
    "/galaxies",
    validateCreateGalaxy,
    checkGalaxyIdDuplicate,
    createGalaxy
);

//修改星系
router.patch("/galaxies/:id", findGalaxyById, updateGalaxy);

//刪除星系
router.delete("/galaxies/:id", findGalaxyById, deleteGalaxy);

//--------------------------星球 API-------------------------------------

//取得全部行星或依星系篩選，例如：/planets?galaxy=words
router.get("/planets", getPlanets);

//新增行星
router.post("/planets", validateCreatePlanet, createPlanet);

//修改行星
router.patch("/planets/:id", findPlanetById, updatePlanet);

//刪除行星
router.delete("/planets/:id", findPlanetById, deletePlanet);

module.exports = router;
