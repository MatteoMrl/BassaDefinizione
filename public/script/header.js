const form = document.querySelector("#userForm")
const userButton = document.querySelector("#userButton");
const loginButton = document.querySelector("#loginButton");
const signinButton = document.querySelector("#signinButton");
const logoutButton = document.querySelector("#logoutButton");

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

deleteCookie = () => {
    document.cookie = "jwt=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}

const token = getCookie("jwt");

if(token !== ""){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/token`, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const id = JSON.parse(this.responseText).id;
            const username = JSON.parse(this.responseText).username;
            if(username){
                form.action = `/user/${username}`
                userButton.style.display = "block";
                userButton.innerHTML = `<i class="fa fa-user icon"></i> ${username}`;
                logoutButton.style.display = "block";
            }
        } 
    };
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader('Authorization','Bearer ' + token);
    xhttp.send();
} else {
    loginButton.style.display = "block";
    signinButton.style.display = "block";
}

logoutButton.addEventListener("click", (event) => {
    deleteCookie();
})