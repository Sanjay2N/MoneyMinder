
const token=localStorage.getItem("token");
const transactionButton=document.querySelector("#transaction-button");
transactionButton.addEventListener("click",setDate);
function setDate(){
    Edate.value = new Date().toJSON().slice(0,10);
    Idate.value = new Date().toJSON().slice(0,10);
}

// premium button
const premiumButton=document.querySelector("#premium-button");
const navItems=document.querySelector("#nav-items");
const premiumDiv=document.querySelector("#premium-div")
const transactionDiv=document.querySelector("#transation-body");
premiumButton.addEventListener("click",()=>{
    navItems.classList.add("d-none");
    transactionDiv.classList.add("d-none");
    premiumDiv.classList.remove("d-none");

})
// page loading /page refresh 
getTransaction(1);
const pagination=document.querySelector("#pagination");
const noTransactionMessage=document.querySelector("#no-transaction-message");

async function getTransaction(page){
    try{
        if(page==undefined){
            page=1;
        }
        let transactionsPerPage=localStorage.getItem("transactionsPerPage");
        const response=await axios.get(`../transaction?page=${page}&noItems=${transactionsPerPage}`,{headers:{"Authorization":token}});
        if(response.data.transactions.length===0){
            noTransactionMessage.innerHTML='<h4>No transaction available</h4>';
            return 
        }
        noTransactionMessage.innerHTML=""
        showTransaction(response.data.transactions);
        showPagination(response.data);
    }
    catch(error){
        if(error.response.status===401){
            alert(error.response.data.message);
            logOut();
        }
        else{
            console.log(error);
        }
    }
    
}

// pagination  Input 
const paginationInputDiv=document.querySelector("#pagination-input");
window.addEventListener("scroll", function() {
    if (document.body.scrollHeight>500) { 
        paginationInputDiv.classList.remove("position-absolute");
        paginationInputDiv.classList.add("position-relative");
    } else {
        paginationInputDiv.classList.add("position-absolute");
        paginationInputDiv.classList.remove("position-relative");
    }
  });


