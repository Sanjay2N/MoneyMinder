const jwt=require('jsonwebtoken');
const User=require('../models/user');

exports.authenticate=async (req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user=jwt.verify(token,process.env.SECRETE_KEY);
        const reponse=await User.findByPk(user.userId);
        req.user=reponse;
        next();
    }
    catch(error){
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Time out,Please log in again'});
        } else {
            console.log(error);
            res.status(500).json({ message: 'Server Error',error:error });
        }
    }
}