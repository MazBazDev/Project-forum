const buttonRight = document.getElementById("slideRight");
const buttonLeft = document.getElementById("slideLeft");

buttonRight.onclick = function () {
  document.getElementById("city-map").scrollLeft += 20;
};
buttonLeft.onclick = function () {
  document.getElementById("city-map").scrollLeft -= 20;
};
