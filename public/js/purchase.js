const razorpayButton=document.querySelector("#rzp-button1");
const decodedToken=parseJwt(token);
razorpayButton.onclick=async (e)=>{
    try{
        const response=await axios.get("../purchase/premiummemborship",{headers:{"Authorization":token}});
        var options={
            "key":response.data.key_id,
            "order_id":response.data.order.id,
            //function excecuted on success
            "handler":async function(response){
                const response1=await axios.post("../purchase/updatetransactionstatus",{
                    order_id:options.order_id,
                    payment_id:response.razorpay_payment_id,

                },{headers:{"Authorization":token}});

                alert("You are now premium user,You're welcome");
                localStorage.setItem("token",response1.data.token);
                window.location.href="premium";
            }
        };
        const rzp1=new Razorpay(options);
        rzp1.open();
        e.preventDefault();
        rzp1.on('payment.failed',async function(reponse){
            await axios.post("../purchase/updatetransactionstatus",{order_id:options.order_id,success:false,},{headers:{"Authorization":token}});
            alert("Some thing went wrong");
        })

    }
    catch(error){
        console.log(error);
    }

}


// jwt decode function 
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
