let tbody = document.querySelector("#List");
let writeBtn = document.querySelector(".write-btn");
let page = 1;
//글쓰기 버튼
writeBtn.addEventListener("click", function () {
  location.href = "/html/form.html";
});

//--------------------------------------------------------
//페이지 진입 시 바로 실행
loadBoardList(page);
//---------------------------------------------------------
//목록 불러오기 && 검색창 비어 있을 시 사용
function loadBoardList(page = 1) {
  tbody.innerHTML = "";

  fetch(`/users/board/${page}`) //
    .then((resp) => resp.json())
    .then((data) => {
      data.forEach((ele) => {
        const tr = makeRow(ele);
        tbody.appendChild(tr);
      });
    });
}
//목록 생성
function makeRow(ele = {}) {
  const tr = document.createElement("tr");
  //보여줄 항목들
  for (let board of ["BOARD_NO", "TITLE", "WRITER", "CREATED_AT"]) {
    const td = document.createElement("td");
    if (board === "TITLE") {
      td.innerHTML = ele[board];
      td.style.cursor = "pointer";
      td.addEventListener("click", function () {
        //게시글 번호 가지고 상세페이지 이동
        location.href = `/html/detail.html?no=${ele.BOARD_NO}`;
      });
    } else {
      td.innerHTML = ele[board];
    }
    tr.appendChild(td);
  }
  return tr;
  //td,button
}

//검색

let searchBtn = document.querySelector(".search-btn"); //검색 버튼
let searchBox = document.querySelector("#searchBox"); //검색창
searchBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    //검색창 엔터키 가능
    searchBtn.click();
  }
});
searchBtn.addEventListener("click", find);
//검색 기능
function find() {
  let keyword = searchBox.value;
  tbody.innerHTML = "";
  if (!keyword.trim()) {
    loadBoardList(1); // 기존 목록 다시 불러오기
    return;
  }

  fetch(`/users/board/find/${encodeURIComponent(keyword)}`)
    .then((resp) => resp.json())
    .then((data) => {
      tbody.innerHTML = "";
      data.forEach((ele) => {
        const tr = makeRow(ele);
        tbody.appendChild(tr);
      });
    });
}
