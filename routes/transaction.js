const express=require('express');
const router=express.Router();
const transactionController=require("../controllers/transaction");
const userAuthenticate=require("../middleware/auth");

router.post("",userAuthenticate.authenticate,transactionController.addUserTransaction);
router.get("",userAuthenticate.authenticate,transactionController.getUserTransactions);
router.delete("/:transactionId",userAuthenticate.authenticate,transactionController.deleteUserTransaction);
router.get("/edit/:transactionId",userAuthenticate.authenticate,transactionController.editTransactionDetails)
router.get("/:transactionId",userAuthenticate.authenticate,transactionController.getTransactionDetails)

module.exports=router;