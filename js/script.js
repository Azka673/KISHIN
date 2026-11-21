const enterButton = document.getElementById("enter-button");
const introScreen = document.querySelector(".intro-screen");

enterButton.addEventListener("click", function () {

    introScreen.classList.add("hide");

    window.location.hash = "home";

});