const { Sequelize, DATEONLY } = require("sequelize");
const sequelize=require("../util/database");
const User=require("../models/user");
const S3services=require("../services/s3services");
const DownloadTransaction=require("../models/downloadedTransaction");
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

