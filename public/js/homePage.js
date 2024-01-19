
// navbar part
const navbar=document.querySelector("#navbar");
const signupButton=navbar.querySelector("#signup");
const signupButton1=document.querySelector("#signup1");
const loginButton=navbar.querySelector("#login");
const navItems=navbar.querySelector("#nav-items");


const homeBody=document.querySelector("#home-body");
const signupDiv=document.querySelector("#signup-body");
const loginDiv=document.querySelector("#login-body");
const forgetPasswordDiv=document.querySelector("#forget-password-body");


//sign up 
signupButton1.addEventListener("click",signup);
signupButton.addEventListener("click",signup);

function signup(e){
    e.preventDefault();
    hideElement(homeBody);
    hideElement(navItems);
    showElement(signupDiv);
}

//login 
loginButton.addEventListener("click",(e)=>{
    e.preventDefault();
    hideElement(homeBody);
    hideElement(navItems);
    showElement(loginDiv);
});


function hideElement(element){
    element.classList.remove("d-block");
    element.classList.add("d-none");
}
function showElement(element){
    element.classList.add("d-block");
    element.classList.remove("d-none");
}

//login form part
const logInForm=loginDiv.querySelector("#loginform");
const warningDiv4=loginDiv.querySelector("#warning4");
const warningDiv5=loginDiv.querySelector("#warning5");
const warningDiv6=loginDiv.querySelector("#warning6");
const successDiv2=loginDiv.querySelector("#success2");
const loginFormSignupButton=loginDiv.querySelector("#signup");
const forgetPasswordButton=loginDiv.querySelector("#forget-password");
forgetPasswordButton.addEventListener("click",(e)=>{
    e.preventDefault();
    hideElement(loginDiv);
    showElement(forgetPasswordDiv);
})

loginFormSignupButton.addEventListener("click",(e)=>{
    e.preventDefault();
    hideElement(loginDiv);
    showElement(signupDiv);
})

logInForm.addEventListener("submit",logIn);

async function logIn(e){
    try{
        e.preventDefault();
        const email=e.target.email1.value;
        const password=e.target.password1.value;
        const data={
            email:email,
            password:password,
        };
        const response=await axios.post("user/login",data);
        if(response && response.status==200){
            localStorage.setItem("token",response.data.token);
            localStorage.setItem("transactionsPerPage",5);
            showElement(successDiv2);
            setTimeout(()=>{
                hideElement(successDiv2);
                const decodedToken=parseJwt(response.data.token);
                if(decodedToken.isPremiumUser==true){
                    window.location.href="user/premium";
                }
                else{
                    window.location.href="user/basic";

                }
            },2000);
            e.target.reset();
        }
    }
    catch(error){
        if (error.response && error.response.status === 404) {
            showElement(warningDiv4);
            setTimeout(()=>{hideElement(warningDiv4)},2000);
        } else if (error.response && error.response.status === 401) {
            showElement(warningDiv5);
            setTimeout(()=>{hideElement(warningDiv5)},2000);
        }else if (error.response && error.response.status === 400) {
            showElement(warningDiv6);
            setTimeout(()=>{hideElement(warningDiv6)},2000);
        }
        else {
            console.error( error);
        }
    }
}


//signup part
const form=signupDiv.querySelector("#signup-form");
const warningDiv1=signupDiv.querySelector("#warning1");
const warningDiv2=signupDiv.querySelector("#warning2");
const warningDiv3=signupDiv.querySelector("#warning3");
const successDiv1=signupDiv.querySelector("#success1");
const signupFormLoginButton=signupDiv.querySelector("#login");

signupFormLoginButton.addEventListener("click",(e)=>{
    e.preventDefault();
    hideElement(signupDiv);
    showElement(loginDiv);
})

form.addEventListener("submit",signUp);

async function signUp(e){
    try{
        e.preventDefault();
        const name=e.target.name.value;
        const email=e.target.email.value;
        const phoneNUmber=e.target.number.value;
        const password=e.target.password.value;
        const conformPassword=e.target.conformationPassword.value;

        if(password!==conformPassword){
            showElement(warningDiv2);
            setTimeout(()=>{hideElement(warningDiv2)},2000);
            form.querySelector("#password").value="";
            form.querySelector("#conformationPassword").value="";
            return;
        }

        userDetails={
            name:name,
            phoneNumber:phoneNUmber,
            email:email,
            password:password

        };
        const response=await axios.post("user/signup",userDetails);
        if(response && response.status==201){
            showElement(successDiv1);
            setTimeout(()=>{
                hideElement(successDiv1);
                hideElement(signupDiv);
                showElement(loginDiv);
            },3000);
            e.target.reset();
            
        }

    }
    catch(error){
        if (error.response && error.response.status === 409) {
            showElement(warningDiv1);
            setTimeout(()=>{hideElement(warningDiv1)},2000);
        }else if(error.response && error.response.status === 400){
            showElement(warningDiv3);
            setTimeout(()=>{hideElement(warningDiv3)},2000);
            return;
        } 
        else {
            console.error(error);
        }
        e.target.reset();
    }
}


// forget password
const fogetform=forgetPasswordDiv.querySelector("#forget-password-form");
const warningDiv7=forgetPasswordDiv.querySelector("#warning7");
const successDiv3=forgetPasswordDiv.querySelector("#success3");


fogetform.addEventListener("submit",forgetPassword);

async function forgetPassword(e){
    try{
        e.preventDefault();
        const response=await axios.post("password/forgotpassword",{email:e.target.email2.value});
        showElement(successDiv3);
        setTimeout(()=>{
            hideElement(successDiv3);
            hideElement(forgetPasswordDiv);
            showElement(loginDiv);
            
        },3000);
        e.target.reset(); 
        
    }
    catch(error){
        if (error.response && error.response.status === 404) {
            showElement(warningDiv7);
            setTimeout(()=>{hideElement(warningDiv7)},2000);
        }
        
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
