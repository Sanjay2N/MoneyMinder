const express=require('express');
const router=express.Router();
const premiumFeatureController=require("../controllers/premiumFeature");
const userAuthenticate=require("../middleware/auth");

router.get("/getleaderboard",userAuthenticate.authenticate,premiumFeatureController.getLeaderBoard);
router.get("/downloadtransactions",userAuthenticate.authenticate,premiumFeatureController.downloadTransactions);
router.get("/getDownloadedFileLinks",userAuthenticate.authenticate,premiumFeatureController.getDownloadedFileLinks);


module.exports=router;