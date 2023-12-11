
const token=localStorage.getItem("token");

// navbar 
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


//profile page
const profileButton=document.querySelector("#profile-button");
const profileModal=document.querySelector("#profile-modal");
const profileCard=profileModal.querySelector("#profile-card");
profileButton.onclick=async function(e){
    try{

        const response=await axios.get(`../user/getuserdetails`,{headers:{"Authorization":token}});
        console.log(response.data);
        const {name,email,phoneNumber,totalExpense,totalIncome}=response.data.userDetails;
        profileCard.querySelector("#user-email").innerText=email;
        profileCard.querySelector("#user-name").innerText=name;
        profileCard.querySelector("#user-number").innerText=phoneNumber;
        profileCard.querySelector("#user-expense").innerText=totalExpense;
        profileCard.querySelector("#user-income").innerText=totalIncome;
    }
    catch(error){
        console.log(error);
        alert("505 : Server Error");
    }
    
}

function logOut(){
    console.log("inside of the logout")

    localStorage.removeItem("token");
}


// transaction model
const transactionModal=document.querySelector("#transactionModel");
const transcationModalBody=document.querySelector("#transaction-modal-body");
const incomeButton=transcationModalBody.querySelector("#income-button");
const expenseButton=transcationModalBody.querySelector("#expense-button");
incomeButton.onclick=function(){
    incomeButton.style.backgroundColor='#1974D2';
    incomeButton.style.color="white";
    expenseButton.style.backgroundColor='white';
    expenseButton.style.color='black';
}
expenseButton.onclick=function(){
    expenseButton.style.backgroundColor='red';
    expenseButton.style.color="white";
    incomeButton.style.backgroundColor='white';
    incomeButton.style.color="black";
}

// date pre-filler
document.querySelector(".Idate").value = new Date().toJSON().slice(0,10)
document.querySelector(".Edate").value = new Date().toJSON().slice(0,10)


const incomeForm=document.querySelector("#income-form");
const expenseForm=document.querySelector("#expense-form");
const transactionBody=document.querySelector("#transaction-body");

incomeForm.addEventListener("submit",addTransaction);
expenseForm.addEventListener("submit",addTransaction);
async function addTransaction(e){
    try{
        console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        e.preventDefault();
        const amount=e.target.amount.value;
        const date=e.target.date.value;
        const paymentMethod=e.target.paymentmethod.value;
        const category=e.target.category.value;
        const description=e.target.description.value;
        const type=e.target.type.value;
        const transactionDetails={
            amount:amount,
            date:date,
            paymentmethod:paymentMethod,
            category:category,
            description:description,
            type:type
        }
        const response=await axios.post("../transaction",transactionDetails,{headers:{"Authorization":token}});
        if(response.status==201){
            e.target.reset();
            getTransaction(1);
            return;
        }
    }
    catch(error){
        console.log(error)
        if(error.response.status==400){
            document.querySelector("#warning").innerText=error.response.data.message;
        }
        else{
            console.log(error)
        }
    }
}


// page loading /page refresh 
// window.addEventListener("DOMContentLoaded",getTransaction);
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
        }
        else{
            console.log(error);
        }
    }
    
}

function showTransaction(transactions){
    transactionBody.innerHTML="";
    transactions.forEach(transaction=>{
        const id="transaction-"+transaction.id;
        let color;
        let sign;
        if(transaction.type=="income"){
            color="text-primary";
            sign="+";
        }
        else{
            color="text-danger";
            sign="-";
        }
        transactionBody.innerHTML+=`
        <tr id=${id} class ="bg-white" onclick='showDetails(event,${transaction.id})'>
                        <td class="${color}">${transaction.formateddate}</td>
                        <td class="${color}">${sign}${transaction.amount}</td>
                        <td class="${color}">${transaction.paymentmethod}</td>
                        <td class="${color}"->${transaction.category}</td>
                        <td><button class='btn btn-info ${transaction.id} edit '  onclick='editTransaction(event,${transaction.id})' id=" edit-${transaction.id}" >edit</button></td>
                        <td><button class='btn btn-danger ${transaction.id} delete'  onclick='deleteTransaction(event,${transaction.id})' id=" delete-${transaction.id}" >delete</button></td>

                        
                    </tr>`
        })

    
               
}

// delete trasaction 
async function deleteTransaction(e,id){
    try{
        e.preventDefault();
        await axios.delete("../transaction/"+id,{headers:{"Authorization":token}});
        transactionBody.querySelector("#transaction-"+id).remove();
    }
    catch(error){
            console.log(error);
    }
}

// edit transaction
const editExpenseForm=document.querySelector("#edit-expense-form");
const editIncomeForm=document.querySelector("#edit-income-form");


async function editTransaction(e,id){
    try{
        e.preventDefault();
        const transactionDetails=await axios.get("../transaction/edit/"+id,{headers:{"Authorization":token}});
        document.querySelector("#transaction-"+id).remove();
        const{amount,category,description,paymentmethod,date,type}=transactionDetails.data.transaction;
        if(type==="expense"){
            $("#edit-expense-modal").modal("show");
            populateFormWithValues(editExpenseForm,[amount,category,description,paymentmethod,date]);

        }
        else{
            $("#edit-income-modal").modal("show");
            populateFormWithValues(editIncomeForm,[amount,category,description,paymentmethod,date]);
        }
    }
    catch(error){
            console.log(error);
    }
}

function populateFormWithValues(form,values){
    form.amount.value=values[0];
    form.category.value=values[1];
    form.description.value=values[2];
    form.paymentmethod.value=values[3];
    form.date.value=values[4];
}

editExpenseForm.addEventListener('submit',addTransaction);
editIncomeForm.addEventListener('submit',addTransaction);



// change of transaction per page 
const transactionPerPageInput=document.querySelector("#transactions-per-page");

transactionPerPageInput.addEventListener("change",(e)=>{
    localStorage.setItem("transactionsPerPage",transactionPerPageInput.value);
    window.location.reload();
})


// pagination part 
function showPagination({currentPage,hasNextPage,nextPage,hasPreviousPage,previousPage}){
    if(hasPreviousPage==false && hasNextPage==false){
        return;
    }
    pagination.innerHTML='';
    if(hasPreviousPage){
        addPaginationButton(previousPage,false);
    }
    addPaginationButton(currentPage,true);
    if(hasNextPage){
        addPaginationButton(nextPage,false);
    }
}

function addPaginationButton(page_number,currentpage){
    const Button=document.createElement('button');
        Button.classList.add("btn","btn-secondary","btn-sm","h-25","d-block");
        if(currentpage===false){
            Button.innerHTML=`<h6>${page_number}</h6>`;
        }
        else{
            Button.innerHTML=`<h5>${page_number}</h5>`;
        }
        Button.addEventListener("click",()=>getTransaction(page_number));
        pagination.append(Button);

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


//   transaction-details-modal popup 
const transactionDetailsBody=document.querySelector("#detailsmodalbody");
async function showDetails(e,id){
    if(e.target.classList.contains("edit") || e.target.classList.contains("delete")){
        return;
    }
    const transactionDetails=await axios.get("../transaction/"+id,{headers:{"Authorization":token}});
    $("#transaction-details-modal").modal("show");
    const {amount,formateddate,paymentmethod,category,description,type}=transactionDetails.data.transaction;
    if(type==='expense'){
        const amountEle=transactionDetailsBody.querySelector("#amount");
        amountEle.innerText="- "+amount;
        amountEle.style.color="red";

    }
    else{
        const amountEle=transactionDetailsBody.querySelector("#amount");
        amountEle.innerText="+ "+amount;
        amountEle.style.color="#0275d8";

    }
    transactionDetailsBody.querySelector("#category").innerText=category;
    transactionDetailsBody.querySelector("#date").innerText=formateddate;
    transactionDetailsBody.querySelector("#paymentmethod").innerText=paymentmethod;
    transactionDetailsBody.querySelector("#description").innerText=description;
    
}