const User = require('../models/user');
exports.getTransactions=(req,where)=>{
    return req.user.getTransactions(where);
}

exports.createUser = async (name,phoneNumber,email,password) => {
    try {
        const user = await User.create({
            name:name,
            email:email,
            phoneNumber:phoneNumber,
            password:password
        });
        return user;
        
    } catch (error) {
        throw error
    }
}
exports.getUserbyemail = async (email) => {
try {
    const user=await User.findOne({where:{email}});
    return user;
    
} catch (error) {
    throw error
}
}