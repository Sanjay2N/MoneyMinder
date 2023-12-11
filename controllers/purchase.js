const Razorpay=require('razorpay');
const Order=require("../models/order");
const sequelize=require("../util/database");
const jwt=require('jsonwebtoken');

function getAccessToken(id,isPremiumUser){
    return jwt.sign({userId:id,isPremiumUser:isPremiumUser},process.env.SECRETE_KEY);
}

exports.purchasePremiumMemborship=async (req,res)=>{
    try{
        var rzp=new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRETE,
        });
        const amount=50000;
        rzp.orders.create({"amount":amount,"currency":"INR"},async(err,order)=>{
            if(err){
                return res.status(401).json({error:err})
            }
            const response=await req.user.createOrder({orderid:order.id,status:"PENDING"});
            return res.status(201).json({order,key_id:rzp.key_id});
        })
    }
    catch(error){
        return res.status(403).json({error:error});
    }
}

exports.updateTransactionStatus=async(req,res)=>{
    const t= await sequelize.transaction();
    try{
        if(req.body.success==false){
            const order=await Order.findOne({where:{orderid:req.body.order_id}});
            await order.update({status:"FAILED"});
            return res.status(200).json({success:false,message:"transaction unsuccessful"});
        }
        const {payment_id,order_id}=req.body;
        const order=await Order.findOne({where:{orderid:order_id}});
        await Promise.all([order.update({paymentid:payment_id,status:"SUCCESSFUL"}),{transaction:t},req.user.update({ispremiumuser:true},{transaction:t})]);
        await t.commit();
        console.log(getAccessToken(req.user.id,req.user.ispremiumuser),req.user.id,req.user.ispremiumuser)
        return res.status(200).json({success:true,message:"transaction successful",token:getAccessToken(req.user.id,true)});
    }
    catch(error){
        await t.rollback();
        return res.status(401).json({error:"something went wrong"})
    }
}