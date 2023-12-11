const User=require("../models/user");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const userServices=require("../services/userServices");
const { use } = require("../routes/user");

exports.getMainPage = async(req, res) => {
    try{
        
    // const isPremiumUser=req.query.ispremiumuser;
    // const id=req.query.id;
    // const user=await User.findOne({where:{id:id}});
    // if(String(user.ispremiumuser)!==isPremiumUser){
    //     return res.status(400).res({message:"wrong inputs"});
    // }

    // if(isPremiumUser==='true'){
    //     return res.sendFile('premiumUserMainPage.html', { root: 'views' });
    // }
    return res.sendFile('mainPage.html', { root: 'views' });
}

catch(error){
    console.log(error);
}
}
exports.getPremiumMainPage=(req,res)=>{
    return res.sendFile('premiumUserMainPage.html', { root: 'views' });
    
}



function isNotValidInput(string){
    if(string.lenth===0 || string==undefined){
        return true;
    }
    return false;
}


// signup part
exports.userSignup=async(req,res)=>{
    try{
        const {name,phoneNumber,email,password}=req.body;
        if(isNotValidInput(name) || isNotValidInput(email) || isNotValidInput(phoneNumber) || isNotValidInput(password)){
            return res.status(400).json({error:"Bad parameter"});
        }
        const user=await userServices.getUserbyemail(email);
        if(user){
            return res.status(401).json({error:"user already exists"});
        }
        const saltrounds=10;
        bcrypt.hash(password,saltrounds,async(err,hash)=>{
        const response=await userServices.createUser(name,phoneNumber,email,hash);
        return res.status(201).json(response);
    })
    }
    catch(error){
        res.status(500).json({error:error});
    }
}


// login part

function getAccessToken(id,isPremiumUser){
    return jwt.sign({userId:id,isPremiumUser:isPremiumUser},process.env.SECRETE_KEY,{ expiresIn: '1h' });
}

exports.userLogin=async (req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(isNotValidInput(email) || isNotValidInput(password)){
            return res.status(400).json({error:"bad parameters"});
        }
        const response = await userServices.getUserbyemail(email);
        if(!response){
            return res.status(404).json({error:"user doesn't exists"});
        }
        const userDetails=response.dataValues;
        bcrypt.compare(password,userDetails.password,(error,response)=>{
                if(error || response==false){
                    return res.status(401).json({error:error});
                }
                else{
                    res.status(200).json({token:getAccessToken(userDetails.id,userDetails.ispremiumuser)});
                }
            })
    }
    catch(error){
        res.status(500).json({error:error});
    }
}

exports.getUserDetails=async(req,res)=>{
    try{
        const user=req.user.dataValues;
        const userDetails={name:user.name,email:user.email,phoneNumber:user.phoneNumber,isPremiumuser:user.ispremiumuser,totalExpense:user.totalexpense,totalIncome:user.totalincome};
        res.status(200).json({userDetails:userDetails});
    }
    catch(error){
        res.status(500).json({error:error});
    }
}