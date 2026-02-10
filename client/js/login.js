const form = document.querySelector("#loginForm");
const userId = document.querySelector("#user_id");
const password = document.querySelector("#password");

//로그인 정보 보내기

form.addEventListener("submit", function (e) {
  e.preventDefault(); // 기본 form 제출 방지
  loginUser(); // 로그인 함수 호출
});

function loginUser() {
  fetch("http://localhost:3000/users/login", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId.value,
      password: password.value,
    }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      if (data.retCode == "OK") {
        location.href = "/html/board.html";
      } else {
        alert("로그인 실패");
      }
    })
    .catch((err) => console.log(err));
}
