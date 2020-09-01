const stars = document.querySelectorAll(".fa-star")
const rating = document.querySelector("#starRating");
const filmName = document.querySelector("#title").innerHTML;
const message = document.querySelector("#message");
var starRating = 1;

stars.forEach((value,index) => {
    value.addEventListener("mouseover", () => {
        for(i=2; i<stars.length; i++){  //così è impossibile dar meno di 1 stella
            stars[i].classList.add("far");
            stars[i].classList.remove("fas");
        }
        for(i=1; i<=index; i++){
            stars[i].classList.add("fas");
            stars[i].classList.remove("far");
        }
    })
    value.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const {vote} = JSON.parse(this.responseText);
            if(vote){
                message.style.color = "green";
                message.innerHTML = "<i class='far fa-check-circle'></i> FILM RATED CORRECTLY";
            } else {
                message.style.color = "red";
                message.innerHTML = "<i class='fas fa-exclamation-circle'></i> FILM ALREADY VOTED";
            }
            
        }
        };
        xhttp.open("GET", `/vote?film=${encodeURIComponent(filmName)}&rating=${index}`, true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.setRequestHeader('Authorization','Bearer ' + token);
        xhttp.send();
    })
})
if(token !== ""){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/token`, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(JSON.parse(this.responseText).username){
                rating.style.display = "block";
            }
        }
    };
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader('Authorization','Bearer ' + token);
    xhttp.send();
} else {
    rating.style.display = "none";
}