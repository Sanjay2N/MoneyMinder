const { response } = require("express");
const Transaction=require("../models/transaction");
const sequelize=require("../util/database");
const Userservices=require("../services/userServices");
const Sequelize = require("sequelize");
const { Op } = require('sequelize');


exports.addUserTransaction=async (req,res)=>{
    const t= await sequelize.transaction();
    try{
        const {amount,date,paymentmethod,category,description,type}=req.body;
        if(isStringsNotValidate([amount,date,paymentmethod,category,type])){
            return res.status(400).json({message:"some thing missing"});
        }
        if(type==="income"){
            const newTotalIncome=req.user.totalincome+parseInt(amount);
            await req.user.update({totalincome:newTotalIncome},{transaction:t});
        }
        else if(type==="expense"){
            const newTotalExpense=req.user.totalexpense+parseInt(amount);
            await req.user.update({totalexpense:newTotalExpense},{transaction:t});
        }
        const response=await req.user.createTransaction({
            amount:amount,
            date:date,
            category:category,
            description:description,
            paymentmethod:paymentmethod,
            type:type

        },{transaction:t});
        await t.commit();
        return res.status(201).json(response);

    }
    catch(error){
        await t.rollback();
        res.status(500).json({error:error});
    }
}


exports.getUserTransactions=async(req,res)=>{
    try{
        const ITEMS_PER_PAGE=parseInt(req.query.noItems);
        const page=parseInt(req.query.page);
        const isPremiumUser=req.user.dataValues.ispremiumuser;
        let dateRangeCondition={};
        if(isPremiumUser){
            const periodRange=new Date(req.query.periodRange);
            const periodRangeList=req.query.periodRange.split("-");
            if(periodRangeList.length===3){
                dateRangeCondition={date:{[Op.between] :[periodRange ,periodRange ]}};
            }
            else if(periodRangeList.length===2){
                const start=new Date(periodRange.getFullYear(),periodRange.getMonth(),1);
                const end=new Date(periodRange.getFullYear(),periodRange.getMonth()+1,0);
                dateRangeCondition={date:{[Op.between] :[start ,end]}};
            }
            else{
                const start=new Date(periodRange.getFullYear()-1,12,1);
                const end=new Date(periodRange.getFullYear(),12,0);
                dateRangeCondition={date:{[Op.between] :[start ,end]}};
            }
        }
        const totalItems=await Transaction.count({where:{userId:req.user.id,...dateRangeCondition}} );
        const transactions=await Userservices.getTransactions(req,  {
            where:dateRangeCondition,
            attributes: {
              include: ["id","amount","category","type","description","paymentmethod",
                [ sequelize.fn("DATE_FORMAT", sequelize.col("date"), "%d-%m-%Y "),"formateddate",],
                ],}, offset:(page-1)*ITEMS_PER_PAGE,limit:ITEMS_PER_PAGE,
            order:['date']
            });
           
        return res.status(200).json({
            
            transactions:transactions,
            currentPage:page,
            hasNextPage:(ITEMS_PER_PAGE*page)<totalItems,
            nextPage:page+1,
            hasPreviousPage:page>1,
            previousPage:page-1,
            lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE),
        });
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({error:error})
    }
}


exports.deleteUserTransaction=async(req,res)=>{
    const t=await sequelize.transaction();
    try{
        const id=req.params.transactionId;
        if(id==undefined || id.length===0){
            return res.status(400).json();
        }
        const transaction=await Transaction.findOne({where:{id:id,userId:req.user.id}},{transaction:t});
        if(transaction.length===0){
            return res.json(404).json({success:false});
        }
        if(transaction.type==="income"){
            const updatedTotalIncome=req.user.totalincome-parseInt(transaction.dataValues.amount);
            await Promise.all([req.user.update({totalincome:updatedTotalIncome},{transaction:t}),transaction.destroy({transaction:t})])
        }
        else{
            const updatedTotalExpense=req.user.totalexpense-parseInt(transaction.dataValues.amount);
            await Promise.all([req.user.update({totalexpense:updatedTotalExpense},{transaction:t}),transaction.destroy({transaction:t})])
        }
        await t.commit();
        res.status(200).json();

    }
    catch(error){
        await t.rollback();
        res.status(500).json({error:error});
    }

}

exports.editTransactionDetails= async (req,res)=>{
    const t=await sequelize.transaction();
    try{

        const id=req.params.transactionId;
        if(id==undefined || id.length===0){
            return res.status(400).json();
        }
        const transaction=await Transaction.findOne({where:{id:id,userId:req.user.id}},{transaction:t});
        if(transaction.length===0){
            return res.json(404).json({success:false});
        }
        if(transaction.type==="income"){
            const updatedTotalIncome=req.user.totalincome-parseInt(transaction.dataValues.amount);
            await Promise.all([req.user.update({totalincome:updatedTotalIncome},{transaction:t}),transaction.destroy({transaction:t})])
        }
        else{
            const updatedTotalExpense=req.user.totalexpense-parseInt(transaction.dataValues.amount);
            await Promise.all([req.user.update({totalexpense:updatedTotalExpense},{transaction:t}),transaction.destroy({transaction:t})])
        }
        await t.commit();
        res.status(200).json({transaction:transaction});

    }
    catch(error){
        await t.rollback();
        res.status(500).json({error:error});
    }
}



exports.getTransactionDetails= async (req,res)=>{
    try{
        const id=req.params.transactionId;
        if(id==undefined || id.length===0){
            return res.status(400).json();
        }
        const transaction=await Transaction.findOne({where:{id:id,userId:req.user.id},attributes: {
            include: ["amount","category","type","description","paymentmethod",
              [ sequelize.fn("DATE_FORMAT", sequelize.col("date"), "%d-%m-%Y "),"formateddate",],
              ],}});
        if(transaction.length===0){
            return res.json(404).json({success:false});
        }
        res.status(200).json({transaction:transaction});
    }
    catch(error){
        res.status(500).json({error:error});
    }
}



function isStringsNotValidate(stringArray){
    for(let i=0;i<stringArray.length;i++){
        if(stringArray[i]==undefined || stringArray[i].length==0){
            return true;
        }
    }
    return false;
}
