document.addEventListener("DOMContentLoaded", () => {
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");

  btnBack.addEventListener("click", () => {
    window.location.href = "/";
  });

  btnNext.addEventListener("click", () => {
    window.location.href = "/roles";
  });
});
