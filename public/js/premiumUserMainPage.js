let dateRange;
const token=localStorage.getItem("token");

// navbar features
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
        console.log(error)
    }
}

function logOut(){
    localStorage.removeItem("token");
}

// leader board
const leaderBoardButton=document.querySelector("#leader-board-button");
const leaderBoardList=document.querySelector("#leader-list");
leaderBoardButton.addEventListener("click",getLeaderBoard);
async function getLeaderBoard(){
    leaderBoardList.innerHTML='';
    const response=await axios.get("../premium/getleaderboard",{headers:{"Authorization":token}});
    response.data.forEach(leaderDetails=>{
        console.log(leaderDetails);
        addToLeaderBoard(leaderDetails);
    })
}
function addToLeaderBoard(leaderDetails){
    if(leaderDetails.total_transaction===0){
        return;
    }
    leaderBoardList.innerHTML+=`<li class="list-group-item d-flex justify-content-between ">
    <span class="text-black" style="margin-left: -100 !important">${leaderDetails.name}</span>
    <span class="">${leaderDetails.total_transaction}</span>
  </li>`
}

// download transaction file
const downloadButton=document.querySelector("#download-button");
const downloadedList=document.querySelector("#downloade-files");
const downloadNewFile=document.querySelector("#download-new-file");
downloadButton.addEventListener("click",getDownloadedFileList);
async function getDownloadedFileList(){
    try{
        const fileList=await axios.get("../premium/getDownloadedFileLinks",{headers:{"Authorization":token}});
        addLinkToDownloadModal(fileList.data.fileLinks)
    }
    catch(error){
        console.log(error);
    }
}

function addLinkToDownloadModal(links){
    downloadedList.innerHTML="";
    links.forEach(link=>{
        let liElement=document.createElement('li');
        let aElement=document.createElement('a');
        aElement.href=link.fileurl;
        aElement.download="mytrasaction"+link.createdAt+".pdf";
        aElement.textContent=link.formateddate;
        liElement.appendChild(aElement);
        downloadedList.append(liElement);

    });
}

downloadNewFile.addEventListener("click",download);
async function download(event){
    try{
        event.preventDefault();
        const response=await axios.get('../premium/downloadtransactions', { headers: {"Authorization" : token} });
        console.log(response.data)
        if(response.status === 200){
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'mytransaction.txt';
            a.click();
    }
    }
    catch(error){
        console.log(error);
    }
}
 


// left half of webpage 
const leftContent=document.querySelector("#leftContent");
const statasticsDiv=leftContent.querySelector("#statastics-div");
const expStructureButton=statasticsDiv.querySelector("#expense-tab");
const incomeStructureButton=statasticsDiv.querySelector("#income-tab");
const totalIncome=leftContent.querySelector("#total-income");
const totalExpense=leftContent.querySelector("#total-expense");
const balance=leftContent.querySelector("#balance");

function flipcolorButton(btn1,btn2){
    btn1.classList.add('bg-dark','text-white');
    btn2.classList.remove('bg-dark','text-white');

}
expStructureButton.addEventListener("click",()=>{
    flipcolorButton(expStructureButton,incomeStructureButton);
})
incomeStructureButton.addEventListener("click",()=>{
    flipcolorButton(incomeStructureButton,expStructureButton);
})


// pie chart part
let chartRef=[null,null];
let totalTran=[0,0];
const expenseChart = document.querySelector(".exp-chart");
const expenseUl = document.querySelector(".expense-stats .exp-details ul");
const incomeChart = document.querySelector(".inc-chart");
const incomeUl = document.querySelector(".income-stats .inc-details ul");

function createChart(chartData,myChart,ul,index){
    if(chartRef[index]!=null){
        chartRef[index].clear();
        chartRef[index].destroy();
    }
    chartRef[index]=new Chart(myChart, {
    type: "doughnut",
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: "Transaction stats",
          data: chartData.data,
        },
      ],
    },
    options: {
      borderWidth: 10,
      borderRadius: 3,
      hoverBorderWidth: 0,
      
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
  populateUl(ul,chartData);
}
function populateUl(ul,chartData){
    ul.innerHTML='';
    chartData.labels.forEach((l, i) => {
      let li = document.createElement("li");
      li.innerHTML = `${l}: <span class='percentage'>${chartData.data[i]}%</span>`;
      ul.appendChild(li);
    });
  };



function decodeObject(objList,index){
    if(objList.length===0){
        return {labels:[""],data:[0]};
    }
    const categories=[];
    let amountList=[];
    let totalAmount=0;
    objList.forEach(obj=>{
        categories.push(obj.category);
        amountList.push(parseInt(obj.totalamount));
        totalAmount+=parseInt(obj.totalamount);
    });
    totalTran[index]=totalAmount;
    amountList=amountList.map(num=>{
        return ((num/totalAmount)*100).toFixed(1);
    })
    return {labels:categories,data:amountList};
}


// update overview on webpage
function updateOverview(){
    totalIncome.innerText=`+ ${totalTran[1]}  `;
    totalExpense.innerText=`- ${totalTran[0]}  `;
    balance.innerText=`${totalTran[1]-totalTran[0]}  `;
    totalTran=[0,0];
    
}

// right half of webpage

// date selector
const dateSelector=document.querySelector("#date-range-selector");
const inputs=dateSelector.getElementsByTagName("input");
inputs[0].value = new Date().toISOString().substring(0, 10);
inputs[1].value = new Date().toISOString().substring(0,7);
inputs[2].value = new Date().toISOString().substring(0,4);
dateRange=inputs[0].value;

// button color toggler 
const buttons = dateSelector.getElementsByClassName('button');
function changeColor(button,inputId) {
  // Reset the color of all buttons
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.backgroundColor = "white";
    buttons[i].style.color = "black";
    inputs[i].parentElement.classList.remove("d-block");
    inputs[i].parentElement.classList.add("d-none");
  }
  // Change the color of the clicked button
  const input=dateSelector.querySelector(`#${inputId}`);
  button.style.color = "white";
  button.style.backgroundColor = '#e61919';
  input.parentElement.classList.add("d-block");
  input.parentElement.classList.remove("d-none");
  dateRange=input.value;
}


// date selector button event addListener
buttons[0].addEventListener("click",()=>{
    dateRange=inputs[0].value;
    getTransaction(1,inputs[0].value)
});
buttons[1].addEventListener("click",()=>{
    dateRange=inputs[1].value;
    getTransaction(1,inputs[1].value)
});
buttons[2].addEventListener("click",()=>{
    dateRange=inputs[2].value;
    getTransaction(1,inputs[2].value)
});

// formateddate selector inputs event addListener
inputs[0].addEventListener('change', function (e) {
    dateRange=inputs[0].value;
    getTransaction(1,inputs[0].value)
});
inputs[1].addEventListener('change', function (e) {
    dateRange=inputs[1].value;
    getTransaction(1,inputs[1].value)
});
inputs[2].addEventListener('change', function (e) {
    dateRange=inputs[2].value;
    getTransaction(1,inputs[2].value)
});


// page load/reload 

// pagination part
const pagination=document.querySelector("#pagination");
const noTransactionMessage=document.querySelector("#no-transaction-message");
// get transactions
getTransaction();
async function getTransaction(pageNumber,periodRange){
    try{
        if(pageNumber===undefined){
            pageNumber=1;
        }
        if(periodRange===undefined){
            periodRange=dateRange;
        }
        let transactionsPerPage=localStorage.getItem("transactionsPerPage");
        const response=await axios.get(`../transaction?page=${pageNumber}&noItems=${transactionsPerPage} &periodRange=${periodRange}`,{headers:{"Authorization":token}});
        pagination.innerHTML='';
        if(response.data.transactions.length===0){
            noTransactionMessage.innerHTML='<h4>No transaction available</h4>';
            transactionBody.innerHTML="";
            chartRef.forEach(chart=>{
                if(chart!==null){
                    chart.clear();
                    chart.destroy();
                }
            })
            chartRef=[null,null];
            expenseUl.innerHTML='<ul></ul>'
            incomeUl.innerHTML='<ul></ul>'
            createChart({labels:[""],data:[0]},expenseChart,expenseUl,0);
            createChart({labels:[""],data:[0]},incomeChart,incomeUl,1);
            updateOverview();
            return 
        }
        noTransactionMessage.innerHTML="";
        showTransaction(response.data.transactions);
        showPagination(response.data);
        const expenseDetails=response.data.expenseDetails;
        const incomeDetails=response.data.incomeDetails;
        createChart(decodeObject(expenseDetails,0),expenseChart,expenseUl,0);
        createChart(decodeObject(incomeDetails,1),incomeChart,incomeUl,1);
        updateOverview();

    }
    catch(error){
        if(error.response.status==401){
            alert(error.response.data.message);
        }
        else{
            console.log(error)
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
                    <td class="${color}">${sign}${transaction.amount}<i class="fa fa-rupee mt-1 ms-1" style="font-size: 15px;"></i></td>
                    <td class="${color}">${transaction.paymentmethod}</td>
                    <td class="${color}"->${transaction.category}</td>
                    <td><button class='btn btn-info ${transaction.id} edit '  onclick='editTransaction(event,${transaction.id})' id=" edit-${transaction.id}" >edit</button></td>
                    <td><button class='btn btn-danger ${transaction.id} delete'  onclick='deleteTransaction(event,${transaction.id})' id=" delete-${transaction.id}" >delete</button></td>
                  </tr>`
    })
}

async function deleteTransaction(e,id){
    try{
        e.preventDefault();
        const response=await axios.delete("../transaction/"+id,{headers:{"Authorization":token}});
        document.querySelector("#transaction-"+id).remove();
    }
    catch(error){
        console.log(error);
    }
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
transcationModalBody.querySelector(".Idate").value = new Date().toJSON().slice(0,10)
transcationModalBody.querySelector(".Edate").value = new Date().toJSON().slice(0,10)

//add transaction 
const incomeForm=document.querySelector("#income-form");
const expenseForm=document.querySelector("#expense-form");
const transactionBody=document.querySelector("#transaction-body");
const transactionModel=document.querySelector("#transactionModel");

incomeForm.addEventListener("submit",addTransaction);
expenseForm.addEventListener("submit",addTransaction);
async function addTransaction(e){
    try{
        e.preventDefault();
        const amount=e.target.amount.value;
        const formateddate=e.target.date.value;
        const paymentMethod=e.target.paymentmethod.value;
        const category=e.target.category.value;
        const description=e.target.description.value;
        const type=e.target.type.value;
        const transactionDetails={
            amount:amount,
            date:formateddate,
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
        console.log(error.response.data.status)
        if(error.response.status==400){
            transactionModel.querySelector("#warning").innerText=error.response.data.message;
        }
        
        else{
            console.log(error)
        }
    }
}


// edit income/expense part
const editExpenseForm=document.querySelector("#edit-expense-form");
const editIncomeForm=document.querySelector("#edit-income-form");
async function editTransaction(e,id){
    try{
        e.preventDefault();
        const token=localStorage.getItem("token");
        const transactionDetails=await axios.get("../transaction/edit/"+id,{headers:{"Authorization":token}});
        document.querySelector("#transaction-"+id).remove();
        const{amount,category,description,paymentmethod,date,type}=transactionDetails.data.transaction;
        if(type==="expense"){
            $("#edit-expense-modal").modal("show");
            editExpenseForm.amount.value=amount;
            editExpenseForm.category.value=category;
            editExpenseForm.description.value=description;
            editExpenseForm.paymentmethod.value=paymentmethod;
            editExpenseForm.date.value=date;
        }
        else{
            $("#edit-income-modal").modal("show");
            editIncomeForm.amount.value=amount;
            editIncomeForm.category.value=category;
            editIncomeForm.description.value=description;
            editIncomeForm.paymentmethod.value=paymentmethod;
            editIncomeForm.date.value=date;
        }
    }
    catch(error){
        console.log(error);
    }
}
editExpenseForm.addEventListener('submit',addTransaction);
editIncomeForm.addEventListener('submit',addTransaction);



// change of transaction per page 
const transactionPerPageInput=document.querySelector("#transactions-per-page");
transactionPerPageInput.addEventListener("change",()=>{
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
        Button.addEventListener("click",()=>getTransaction(page_number,dateRange));
        pagination.append(Button);

}

//   transaction-details-modal.
const transactionDetailsModal=document.querySelector("#transaction-details-modal");
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
