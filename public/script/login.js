const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const button = document.querySelector("button");
    var validUsername = false;
    var validPassword = false;
    button.disabled = true;

    checkUsername = () => {
        var regex = /^(?=.{3,14}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
        if(usernameInput.value.match(regex)){
            validUsername = true;
            usernameInput.classList.remove("invalid");
            usernameInput.classList.add("valid");
        } else {
            validUsername = false;
            usernameInput.classList.remove("valid");
            usernameInput.classList.add("invalid");
        }
    }

    checkPassword = () => {
        var regex=  /^[A-Za-z]\w{5,13}$/;
        if(passwordInput.value.match(regex)){
            validPassword = true;
            passwordInput.classList.remove("invalid");
            passwordInput.classList.add("valid");
        } else {
            validPassword = false;
            passwordInput.classList.remove("valid");
            passwordInput.classList.add("invalid");
        }
    }

    validButton = () => {
        if(validUsername === true && validPassword === true){
            button.disabled = false;
            button.style.backgroundColor="white";
        } else {
            button.disabled = true;
            button.style.backgroundColor="red";
        }
    }

    usernameInput.addEventListener("keydown", ()=> {
        checkUsername();
        validButton();
    })
    usernameInput.addEventListener("change", ()=> {
        checkUsername();
        validButton();
    })

    passwordInput.addEventListener("keydown", () => {
        checkPassword();
        validButton();
    })
    passwordInput.addEventListener("change", () => {
        checkPassword(passwordInput.value);
        validButton();
    })

    button.addEventListener("mouseover", ()=>{
        button.style.backgroundColor="green";
    })
    button.addEventListener("mouseout", ()=>{
        button.style.backgroundColor="white";
    })
    button.addEventListener("click", async (e) => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", `/login`, true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send(`username=${usernameInput.value}&password=${passwordInput.value}`)
    })