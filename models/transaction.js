const sequelize=require("../util/database");
const Sequelize=require("sequelize");

const transaction=sequelize.define("transaction",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    date:{
        type:Sequelize.DATEONLY(),
        allowNull:false,
    },
    amount:{
        type:Sequelize.INTEGER,
        allowNull:false,

    },
    paymentmethod:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    category:{
        type:Sequelize.STRING,
        allowNull:false,

    },
    description:{
        type:Sequelize.STRING,
    },
    type:{
        type:Sequelize.STRING,
        allowNull:false,
    }
    
})

module.exports=transaction;