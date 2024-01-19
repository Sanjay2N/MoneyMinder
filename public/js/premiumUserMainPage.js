let dateRange;
const token=localStorage.getItem("token");



// leader board
const leaderBoardButton=document.querySelector("#leader-board-button");
const leaderBoardList=document.querySelector("#leader-list");
leaderBoardButton.addEventListener("click",getLeaderBoard);
async function getLeaderBoard(){
    leaderBoardList.innerHTML='';
    const response=await axios.get("../premium/getleaderboard",{headers:{"Authorization":token}});
    response.data.forEach(leaderDetails=>{
        addToLeaderBoard(leaderDetails);
    })
}
function addToLeaderBoard(leaderDetails){
    if(leaderDetails.total_transaction==0){
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
        if(error.response.status==401){
            alert("Session Time Out,Login again ");
            logOut();
        }
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
        if(error.response.status==401){
            alert("Session Time Out,Login again ");
            logOut();
        }
    }
}
 
// date setters
const transactionButton1=document.querySelector("#transaction-button1");
const transactionButton2=document.querySelector("#transaction-button2");
transactionButton1.addEventListener("click",setDate);
transactionButton2.addEventListener("click",setDate);
function setDate(){
    Edate.value = new Date().toJSON().slice(0,10);
    Idate.value = new Date().toJSON().slice(0,10);
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

        if(pageNumber==1){
            const statasticsDetails=await axios.get(`../premium/transaction/statastics?periodRange=${periodRange}`,{headers:{"Authorization":token}});
            const expenseDetails=statasticsDetails.data.expenseDetails;
            const incomeDetails=statasticsDetails.data.incomeDetails;
            createChart(decodeObject(expenseDetails,0),expenseChart,expenseUl,0);
            createChart(decodeObject(incomeDetails,1),incomeChart,incomeUl,1);
            updateOverview();
        }
        

    }
    catch(error){
        if(error.response.status==401){
            alert("Session Time Out,Login again ");
            logOut();
        }
        else{
            console.log(error)
        }
        
    }
}

