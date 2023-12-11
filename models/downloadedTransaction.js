const sequelize=require("../util/database");
const Sequelize=require("sequelize");

const DownloadedTransaction=sequelize.define("downloadedtransaction",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    
    fileurl:{
        type:Sequelize.STRING,
        allowNull:false,

    },
})
module.exports=DownloadedTransaction;