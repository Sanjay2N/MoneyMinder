const { Sequelize, DATEONLY } = require("sequelize");
const sequelize=require("../util/database");
const excelJS = require("exceljs");
const User=require("../models/user");
const S3services=require("../services/s3services");
const Userservices=require("../services/userServices");
const DownloadTransaction=require("../models/downloadedTransaction");
const { Op } = require('sequelize');

exports.getLeaderBoard=async(req,res)=>{
    try{
        const response=await User.findAll({
            attributes: [ "name",[
                Sequelize.fn('SUM',Sequelize.where(Sequelize.col('totalincome'), '+', 
                Sequelize.col('totalexpense'))),'total_transaction',],],
              group: ['name'],
              offset:0,
              limit:5,
            order:[['total_transaction','DESC']],
        });
        
        res.status(200).json(response);
    }
    catch(error){
        res.status(500).json({error:error});
    }
}

exports.downloadTransactions=async(req,res)=>{
    try{
        const userId=req.user.id;
        const transactions=await req.user.getTransactions( {
            attributes:  ["date","amount","paymentmethod","category","type","description",],
            order:['date']
            });
        
        const formattedData = transactions.map(item => {
            return  ` Date:  ${item.date}     |  Amount:  ${item.amount}   |  Payment Method:  ${item.paymentmethod} |  Category:  ${item.category}   |  Type: ${item.type}  |   Description:  ${item.description}   `;
          });
        const report = formattedData.join("\n\n");
        const filename=`transactions${userId}/${new Date()}.txt`;
        const fileURL=await S3services.uploadToS3(report,filename);
        await DownloadTransaction.create({fileurl:fileURL,userId:req.user.id});
        res.status(200).json({fileURL:fileURL,successful:true});
    }
    catch(error){
        console.log(error);
        res.status(500).json({fileURL:'',success:false,error:error});
    }
}


exports.getDownloadedFileLinks=async(req,res)=>{
    try{
        const fileLinks=await DownloadTransaction.findAll({where:{userId:req.user.id},attributes: {
            include: ["fileurl",
              [ sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%d-%m-%Y "),"formateddate",],
              ],},
            order: [['formateddate','DESC'],],});
        res.status(200).json({fileLinks})
    }
    catch(error){
        console.log(error);

        res.status(500).json({error})
    }
}

exports.getStatastics=async(req,res)=>{
    try{
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

        
        const expenseDetails=await Userservices.getTransactions(req,{
            where:{...dateRangeCondition,type:"expense"},
            attributes: ['category', [sequelize.fn('sum', sequelize.col('amount')),"totalamount"]], 
                    group: ["category"]
        });
        const incomeDetails=await Userservices.getTransactions(req,{
            where:{...dateRangeCondition,type:"income"},
            attributes: ['category', [sequelize.fn('sum', sequelize.col('amount')),"totalamount"]], 
                    group: ["category"]
        });
        return res.status(200).json({
            expenseDetails:expenseDetails,
            incomeDetails:incomeDetails, 
        });

    }
    catch(error){
        console.log(error);

        res.status(500).json({error})
    }


    
}
