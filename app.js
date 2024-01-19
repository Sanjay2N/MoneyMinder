require('dotenv').config();
const path=require("path");

const express=require("express");
const cors=require("cors");

const userRoutes=require("./routes/user");
const transactionRoutes=require("./routes/transaction");
const purchaseRoutes=require("./routes/purchase");
const forgetPasswordRoutes=require("./routes/forgetPassword");
const premiumFeatureRoutes=require("./routes/premiumFeature");
const homePageRoutes=require("./routes/homePage");

const User=require('./models/user');
const Transaction=require('./models/transaction');
const Order=require("./models/order");
const ForgotPasswordRequest=require("./models/ForgotPasswordRequests");
const DownloadedTransaction=require("./models/downloadedTransaction");

const sequelize=require('./util/database')

const app=new express();

// const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});


app.use(cors());
// app.use(helmet({contentSecurityPolicy: false,}));
// app.use(compression());
// app.use(morgan("combined",{stream:accessLogStream}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'/public')));


app.use(homePageRoutes)
app.use("/user",userRoutes);
app.use("/transaction",transactionRoutes);
app.use("/purchase",purchaseRoutes);
app.use("/premium",premiumFeatureRoutes);
app.use("/password",forgetPasswordRoutes);
app.use("",(req,res) =>{
    res.sendFile('page404.html',{root:'views'});
}

)


Transaction.belongsTo(User);
User.hasMany(Transaction, {
    foreignKey: 'userId'
  });

Order.belongsTo(User);
User.hasMany(Order, {
    foreignKey: 'userId'
});

ForgotPasswordRequest.belongsTo(User);
User.hasMany(ForgotPasswordRequest, {
    foreignKey: 'userId'
});

DownloadedTransaction.belongsTo(User);
User.hasMany(DownloadedTransaction, {
    foreignKey: 'userId'
});

const PORT = process.env.PORT || 2000;
sequelize
// .sync({force:true})
.sync()
.then(result=>{
    app.listen(PORT,()=>{
        console.log("server running in port number "+PORT);
    });
})
.catch(err=>{
    console.log(err);
})

