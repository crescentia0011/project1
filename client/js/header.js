fetch("/html/header.html")
  .then((res) => res.text())
  .then((html) => {
    const headerArea = document.getElementById("header-area"); //헤더영역

    if (headerArea) {
      headerArea.innerHTML = html;

      //사용자 정보 불러옴
      fetch("/users/info")
        .then((res) => res.json())
        .then((data) => {
          if (data.retCode == "OK") {
            document.querySelector(".user-name").textContent =
              "👤 " + data.user_name;
          }
        });

      // 1. 로그아웃 버튼 가져오기
      const logoutBtn = document.querySelector(".logout-btn");

      // 2. 클릭 이벤트 연결
      logoutBtn.addEventListener("click", function () {
        // 3. 서버에 로그아웃 요청
        fetch("/users/logout", {
          method: "POST",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.retCode == "OK") {
              // 4. 로그인 페이지로 이동
              location.href = "/html/login.html";
            }
          });
      });
      //5. 홈으로 이동
      const home = document.querySelector(".logo");

      if (home) {
        home.addEventListener("click", function () {
          location.href = "/html/board.html";
        });
      }
    }
  });
