const express=require('express');
const userAuthenticate=require("../middleware/auth");

const router=express.Router();
const forgetPasswordController=require("../controllers/forgetPassword");
router.post("/forgotpassword",forgetPasswordController.forgetPassword);
router.get("/resetpassword/:requestId",forgetPasswordController.resetPassword);
router.post("/updatepassword/:requestId",forgetPasswordController.updatePassword);

module.exports=router;