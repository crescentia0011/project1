let tbody = document.querySelector("#List");
let page = 1;

fetch(`http://localhost:3000/users/board/${page}`) //
  .then((resp) => resp.json())
  .then((data) => {
    console.log(data);
    data.forEach((ele) => {
      console.log(ele);
      const tr = makeRow(ele);
      tbody.appendChild(tr);
    });
  });

function makeRow(ele = {}) {
  const tr = document.createElement("tr");
  //보여줄 항목들
  for (let board of ["BOARD_NO", "TITLE", "WRITER", "CREATED_AT", "VIEWS"]) {
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
