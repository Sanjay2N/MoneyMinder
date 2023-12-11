const Sequelize=require('sequelize');
const sequelize=require("../util/database");
// const uuidv4=require('uuid').v4;

const ForgotPasswordRequest=sequelize.define('forgotPasswordRequest',{
    id:{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
    },
    
    isactive:Sequelize.BOOLEAN,
})
module.exports=ForgotPasswordRequest;