//최우선 실행
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search); //dom로드 안에 있어서 window붙임
  const no = urlParams.get("no"); //url 내의 아이디 유무 체크
  const isEdit = Boolean(no); // url id 존재시 true(수정하기),  없으면false(새글쓰기 판단)

  const writeBtn = document.querySelector(".write-btn");
  writeBtn.textContent = isEdit ? "수정하기" : "작성하기";
  // 에디터 초기화
  // toastui.Editor() 생성자를 사용해서 에디터 객체를 만듦
  const editor = new toastui.Editor({
    el: document.querySelector("#editor"), // 에디터를 붙일 HTML 요소
    height: "500px",
    initialEditType: "wysiwyg", // 편집 모드: 'wysiwyg'(리치텍스트), 'markdown'(마크다운)
    previewStyle: "vertical", // 미리보기 스타일: 수직
  });

  // 폼 제출 함수
  window.submitForm = function () {
    // 제목 가져오기
    const title = document.getElementById("title").value;

    // 에디터 내용 가져오기 (HTML 형태)
    const content = editor.getHTML();
    if (isEdit) {
      // 수정 API 호출
      fetch(`/board/update/${no}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.retCode === "OK") {
            location.href = "/html/board.html";
          } else {
            alert(data.message || "글 작성 실패");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("서버 오류 발생");
        });
    } else {
      // 작성 API 호출
      fetch("/board/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }), // <-- body는 JSON 문자열만
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.retCode === "OK") {
            location.href = "/html/board.html";
          } else {
            alert(data.message || "글 작성 실패");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("서버 오류 발생");
        });
    }

    //  입력 유효성 검사
    if (!title.trim()) {
      // 제목이 비어있으면
      alert("제목을 입력해주세요.");
      title.focus();
      return; // 함수 종료
    }
    if (!content.trim() || content === "<p><br></p>") {
      // 내용이 비어있으면
      alert("내용을 입력해주세요.");
      editor.focus();
      return;
    }

    // 콘솔 확인 (나중에 서버 전송으로 바꿀 수 있음)
    console.log("제목:", title);
    console.log("내용:", content);

    // 완료 메시지
    alert("게시글 작성 완료! ");
  };

  //글 등록 api
});
