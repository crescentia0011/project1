//input 상자 접근
let pw = document.querySelector("#user_pw1");
let pwck = document.querySelector("#user_pw2");
let id = document.querySelector("#user_id");
let named = document.querySelector("#user_name");
//입력상자에 값이 바뀌는 이벤트 발생하면 이벤트 핸들러 연결
id.addEventListener("change", function () {
  uid = id.value;
  if (uid.length < 3 || uid.length > 10) {
    alert("3글자 이상 10글자 이하를 입력해주세요");
    id.select();
  }
});
//이름 길이 체크
named.addEventListener("change", function () {
  uname = named.value;
  if (uname.length < 2 || uname.length > 8) {
    alert("2글자 이상 8글자 이하로 입력해주세요");
    uname.select();
  }
});
//비밀번호 길이 체크
pw.addEventListener("change", function () {
  upw = pw.value;
  if (upw.length < 4) {
    alert("4글자 이상으로 입력해주세요");
    pw.value = "";
    pw.focus();
  }
});

// 비밀번호가 맞는지 확인
pwck.addEventListener("change", function () {
  let pw = document.querySelector("#user_pw1");
  upw = pw.value;
  upwck = pwck.value;

  console.log(upw);
  console.log(upwck);

  if (upwck != upw) {
    alert("비밀번호가 동일한지 확인해주세요");
    pwck.value = "";
    pwck.focus();
  }
});

//회원가입 정보 보내기
const form = document.querySelector("#register");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // 기본 form 제출 방지
  insertUser(); // 회원가입 함수 호출
});

function insertUser() {
  fetch("http://localhost:3000/users/register", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: id.value,
      user_name: named.value,
      password: pw.value,
    }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      //회원가입 성공 시 로그인 페이지 이동
      if (data.retCode == "OK") {
        location.href = "/html/login.html";
      } else {
        //실패 시 알림창
        alert("회원가입 실패(아이디 중복)");
      }
    })
    .catch((err) => console.log(err));
}
