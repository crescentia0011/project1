const backList = document.querySelector(".back-link");
//현재 url의 정보를 가져와서 객체처럼 저장
//URL에서 ?no=5 같은 쿼리 추출
const params = new URLSearchParams(location.search);
const no = params.get("no"); //객체를 문자열로 반환
const spans = document.querySelectorAll(".detail-info span"); //div안에 span태그 다 가져옴
const content = document.querySelector(".detail-content"); //콘텐트 영역
const editBtn = document.querySelector(".edit-btn"); // 수정버튼
const deleteBtn = document.querySelector(".delete-btn"); //삭제버튼

// 수정버튼 클릭 이벤트
editBtn.addEventListener("click", function () {
  location.href = `/html/form.html?no=${no}`;
});
// 삭제버튼 클릭 이벤트
deleteBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (confirm("이 항목을 삭제하시겠습니까? 복구할 수 없습니다.")) {
    // '확인' 클릭 시 동작
    fetch(`/board/delete/${no}`, {
      method: "DELETE",
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.retCode === "OK") {
          window.location.href = "/html/board.html"; // 성공 시 페이지 이동
        } else {
          // '취소' 클릭 시 동작 (아무것도 안 함)
          return false;
        }
      })
      .catch((err) => {
        console.log("삭제 에러", err);
      });
  }
});
// 목록을 클릭하면 글 목록 페이지로 이동
backList.addEventListener("click", function () {
  location.href = "/html/board.html";
});

fetch("/board/detail/" + no, {
  //이거 없으면 요청자 누군지 모름
  //세션 쿠키 가져오는 방법
  credentials: "include",
})
  .then((resp) => resp.json())
  .then((data) => {
    const post = data.post;
    console.log("글제목", post.TITLE);
    document.querySelector(".detail-title").innerText = post.TITLE; //글제목
    spans[0].innerText = "👤 " + post.WRITER; //작성자
    spans[1].innerText = "📅 " + post.CREATED_AT; //작성시간
    content.innerHTML = post.CONTENT; //내용 태그 제거하고 들고오려고 따로 innertHTML썼음
    // content.innerHTML = DOMPurify.sanitize(post.CONTENT); 보안문제로 위험 스크립트 제어용
    // 여기서 버튼 제어
    if (data.isOwner) {
      document.querySelector(".edit-btn").style.display = "inline-block";
      document.querySelector(".delete-btn").style.display = "inline-block";
    } else {
      document.querySelector(".edit-btn").style.display = "none";
      document.querySelector(".delete-btn").style.display = "none";
    }
  })
  .catch((err) => {
    console.log(err);
  });
