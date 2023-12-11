const express=require('express');
const router=express.Router();
const userController=require("../controllers/user");
const userAuthenticate=require("../middleware/auth");


router.post("/signup",userController.userSignup);
router.post("/login",userController.userLogin);
router.get("/getuserdetails",userAuthenticate.authenticate,userController.getUserDetails);
// router.get("/basicuser",userController.getMainPage);
router.get("/basic",userController.getMainPage);
router.get("/premium",userController.getPremiumMainPage);



module.exports=router;