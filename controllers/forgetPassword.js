const path=require('path');
const User=require("../models/user");
const ForgotPasswordRequest=require("../models/ForgotPasswordRequests");
const bcrypt=require('bcrypt');
const Sib=require('sib-api-v3-sdk');
const client=Sib.ApiClient.instance;
const apiKey=client.authentications['api-key'];
apiKey.apiKey=process.env.FORGET_PASSWORD_API
const tranEmailApi=new Sib.TransactionalEmailsApi();

exports.forgetPassword=async (req,res)=>{
    try{
        const { email } = req.body;
        const user = await User.findOne({ where: {email: email}});
        
        if(user){
            const sender={
                email:'sanjaykcbcs@gmail.com',
                name:"Money Minder",

            };
            const receivers=[{
                email:'sanjaykcbcs@gmail.com',
            }];
            const resetresponse = await user.createForgotPasswordRequest({});
            const { id } = resetresponse;
            const mailresponse = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: "Reset Your password",
                htmlContent: `
              <!DOCTYPE html>
                <html>
                <head>
                    <title>Password Reset</title>
                </head>
                <body>
                    <h1>Reset Your Password</h1>
                    <p>Click the button below to reset your password:</p>
                    <button><a href="${process.env.WEBSITE}/password/resetpassword/{{params.role}}">Reset Password</a></button>
                </body>
                </html>`, params: {
                    role: id
                }
            })
            
            res.status(200).json({ message: 'Password reset email sent' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }


    } catch (error) {
        res.status(500).json({ message: 'Interenal Server Error' });
    }
}


exports.resetPassword=async (req,res)=>{
    try{
        const id=req.params.requestId;
        const requestDetails=await ForgotPasswordRequest.findOne({where:{id:id}});
        if(requestDetails.isactive===false){
           return res.status(400).json();
        }
        await requestDetails.update({ isactive: false});

        res.sendFile('resetPassword.html', {root:path.join(__dirname, '../views')}, function (err) {
            if (err) {
                console.log(err)
            } else {
                res.end()
            }
        });
       
    }
    catch(error){
        res.status(500).json({ message: 'Interenal Server Error' });

    }

}

exports.updatePassword=async(req,res)=>{
    try {
        const { newpassword } = req.body;
        const  id= req.params.requestId;
        const passwordreset=await ForgotPasswordRequest.findOne({ where : { id:id }});
        const userDetails=await User.findOne({where: { id : passwordreset.userId}});
        const currentTime = new Date();
        const createdAtTime = new Date(passwordreset.createdAt);
        const timeDifference = currentTime - createdAtTime;
        const timeLimit = 20 * 60 * 1000; 
        if(timeDifference <= timeLimit){
            const saltrounds=10;
            bcrypt.genSalt(saltrounds, function(err, salt) {
                if(err){
                    console.log(err);
                    throw new Error(err);
                }
                bcrypt.hash(newpassword,salt,async(err,hash)=>{
                await userDetails.update({password:hash});
                return res.status(200).json({message:"password reset successful"})
            });
        });
        }else{
            response.status(403).json({ message: "Link has expired"});
        }
    } 
    catch(error){
        return res.status(500).json({ error, success: false } )
    }
}
