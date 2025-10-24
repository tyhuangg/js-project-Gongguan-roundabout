document.addEventListener("DOMContentLoaded", () => {
  const roles = document.querySelectorAll(".role");
  const btnPlay = document.getElementById("btn-play");
  const btnBack = document.getElementById("btn-back");
  let selected = null;

  roles.forEach(role => {
    role.addEventListener("click", () => {
      roles.forEach(r => r.classList.remove("selected"));
      role.classList.add("selected");
      selected = role.dataset.role;
      btnPlay.disabled = false;
    });
  });

  btnPlay.addEventListener("click", () => {
    alert(`你選擇的角色是：${selected}`);
    // 未來這裡可導向遊戲頁，例如：
    // window.location.href = "/game";
  });

  btnBack.addEventListener("click", () => {
    window.location.href = "/tutorial";
  });
});
