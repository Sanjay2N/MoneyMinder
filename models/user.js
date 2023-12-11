const sequelize=require("../util/database");
const Sequelize=require("sequelize");

const user=sequelize.define("user",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false,

    },
    phoneNumber:{
        type:Sequelize.STRING,
        allowNull:false,

    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true,
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    ispremiumuser:{
        type:Sequelize.BOOLEAN,
       
    },
    totalexpense:{
        type:Sequelize.INTEGER,
        defaultValue: 0
    },
    totalincome:{
        type:Sequelize.INTEGER,
        defaultValue: 0
    },
})

module.exports=user;