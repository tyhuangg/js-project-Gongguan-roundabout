document.addEventListener("DOMContentLoaded", () => {
  const welcomeSection = document.getElementById("welcome");

  // 點擊整個首頁畫面就前往 intro.html
  welcomeSection.addEventListener("click", () => {
    window.location.href = "/intro";
  });
});
