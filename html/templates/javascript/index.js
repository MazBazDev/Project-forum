const buttonRight = document.getElementById("slideRight");
const buttonLeft = document.getElementById("slideLeft");

buttonRight.addEventListener("click", function () {
  const cityMap = document.getElementById("city-map");
  cityMap.scrollLeft += 20;
});

buttonLeft.addEventListener("click", function () {
  const cityMap = document.getElementById("city-map");
  cityMap.scrollLeft -= 20;
});
