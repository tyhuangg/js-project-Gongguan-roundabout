document.addEventListener("DOMContentLoaded", () => {
  const btnNext = document.getElementById("btn-to-teach");

  btnNext.addEventListener("click", () => {
    window.location.href = "/teach";
  });
});