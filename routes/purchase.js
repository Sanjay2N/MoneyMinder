const express=require('express');
const router=express.Router();
const purchaseController=require("../controllers/purchase");
const userAuthenticate=require("../middleware/auth");



router.get("/premiummemborship",userAuthenticate.authenticate,purchaseController.purchasePremiumMemborship);
router.post("/updatetransactionstatus",userAuthenticate.authenticate,purchaseController.updateTransactionStatus);

module.exports=router;