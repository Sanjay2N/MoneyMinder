
const urlSplit = window.location.href.split('/'); 
const id =urlSplit[urlSplit.length - 1];
const myForm = document.querySelector('#resetpasswordform');
const password = myForm.querySelector('#newpassword');
const confirm_password = myForm.querySelector('#newpassword1');
const passwordDiv = document.querySelector('#passwordDiv');
const successDiv = document.querySelector('#successDiv');
myForm.addEventListener('submit',onReset)
async function onReset(e) {
    try {
        if (e.target && myForm.checkValidity()) {
            e.preventDefault();
            if(password.value!==confirm_password.value){
                passwordDiv.classList.remove('d-none');
                passwordDiv.classList.add('d-block');
                setTimeout(() => {
                    passwordDiv.classList.remove('d-block');
                    passwordDiv.classList.add('d-none');
                }, 3000);
            }else{
                const data = {
                    newpassword: password.value,
                };

               const resetresponse =  await axios.post(`../updatepassword/${id}`, data);
               if(resetresponse && resetresponse.status === 200){
                e.preventDefault();
                password.value='';
                successDiv.classList.remove('d-none');
                successDiv.classList.add('d-block');
                setTimeout(() => {
                    successDiv.classList.remove('d-block');
                    successDiv.classList.add('d-none');
                    window.location.href = `/home`;
                }, 1000);

            }
            }
        }

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);

    }
}
