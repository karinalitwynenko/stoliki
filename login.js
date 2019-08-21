function setupLoginPanel(e) {
    var skipButton = document.getElementById("skip");
    skipButton.addEventListener('click',function(e){
        document.getElementById("obscure").style.display = "none";
        document.getElementById("loginPanel").style.display  = "none";
    })
}