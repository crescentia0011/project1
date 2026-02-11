const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { getConnection, oracledb } = require("./server");

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(
  session({
    secret: "my-secret-key", // 아무 문자열 OK
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(cors()); // CORS 설정 (모든 도메인 허용)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../client")); // client 폴더를 정적 파일로 제공
app.set("view engine", "ejs");
app.set("views", "./views");

// DB 연결 테스트
async function testConnection() {
  let connection;
  try {
    connection = await getConnection();
    console.log("✅ Oracle DB 연결 성공!");
  } catch (err) {
    console.error("❌ DB 연결 실패:", err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// ===========================
// API 라우트 (여기에 작성 예정)
// ===========================

// 회원가입 API
app.post("/users/register", async (req, res) => {
  // 1. req.body에서 데이터 꺼내기
  const { user_id, user_name, password } = req.body;
  console.log(req.body);

  const conn = await getConnection();
  const hashedPw = await bcrypt.hash(password, 10); //비밀번호 암호화
  const result = await conn
    .execute(
      `INSERT INTO users (user_id, user_name, password, created_at)
      VALUES (:user_id, :user_name, :password, SYSDATE)`,
      {
        user_id: user_id,
        user_name: user_name,
        password: hashedPw, //암호화 된 비밀번호 저장
      },
      { autoCommit: true },
    )
    .catch((err) => {
      console.error("DB 에러:", err);
      res.json({ retCode: "FAIL" }); // 에러 시 FAIL 응답
      conn.close();
    });

  if (!result) return; // catch에서 처리했으면 중단

  if (result.rowsAffected) {
    res.json({ retCode: "OK" });
  } else {
    res.json({ retCode: "FAIL" });
  }
  conn.close();

  // 일단 응답만 보내기
});

// 로그인 API
app.post("/users/login", async (req, res) => {
  // ===============================
  // 브라우저에서 보낸 값 꺼내기
  // ===============================
  const user_id = req.body.user_id;
  const password = req.body.password;

  console.log("로그인 요청 들어옴");
  console.log("입력한 아이디:", user_id);
  console.log("입력한 비밀번호:", password);

  // 값이 하나라도 없으면 종료
  // 아이디나 비밀번호가 비어있으면
  // DB 갈 필요도 없음
  if (!user_id || !password) {
    res.json({ retCode: "FAIL" });
    return; // 함수 여기서 끝
  }

  // DB 연결을 바깥에서 선언
  // → try 안에서만 선언하면 finally에서 못 씀
  let conn;

  //  try 영역
  // 여기 안에서 에러가 나면 바로 catch로 점프함
  try {
    // DB 연결 시도
    conn = await getConnection();

    // 아이디로 비밀번호 조회
    const result = await conn.execute(
      `SELECT password, user_name FROM users WHERE user_id = :user_id`,
      { user_id },
    );

    console.log("DB 조회 결과:", result.rows);
    // 아이디가 DB에 없는 경우
    // 조회 결과가 0행이면 그런 아이디 없음
    if (result.rows.length === 0) {
      res.json({ retCode: "FAIL" });
      return;
    }
    // DB에 저장된 비밀번호 꺼내기
    // Oracle은 컬럼명을 대문자로 준다고 함
    const dbPw = result.rows[0].PASSWORD;
    console.log("DB에 저장된 비밀번호:", dbPw);

    // 비밀번호 비교
    // bcrypt.compare(입력한비밀번호, DB암호)
    // 같으면 true / 다르면 false
    const match = await bcrypt.compare(password, dbPw);

    // 결과에 따라 응답

    if (match) {
      //세션 저장
      req.session.user = {
        user_id: user_id,
        user_name: result.rows[0].USER_NAME, //유저이름 result에 담겨있는거 불러오기
        //대문자로 해야지 오라클 칼럼 불러올 수 있음
      };
      // 비밀번호 일치
      res.json({ retCode: "OK" });
    } else {
      // 비밀번호 불일치
      res.json({ retCode: "FAIL" });
    }
  } catch (err) {
    // catch 영역
    // try 안에서 에러가 발생하면 코드 실행이 여기로 바로 이동
    console.log("로그인 중 에러 발생:", err);
    res.json({ retCode: "FAIL" });
  } finally {
    // finally 영역
    // 성공이든 실패든 무조건 마지막에 실행함
    if (conn) {
      conn.close(); // DB 연결 정리
    }
  }
});
//세션 로그인 후 확인
app.get("/users/me", (req, res) => {
  if (!req.session.user) {
    res.json({ login: false });
    return;
  }
  res.json({
    login: true,
    user_id: req.session.user.user_id,
  });
});
//세션 정보 가져오기
app.get("/users/info", (req, res) => {
  if (req.session.user) {
    res.json({
      retCode: "OK",
      user_id: req.session.user.user_id,
      user_name: req.session.user.user_name,
    });
  } else {
    res.json({ retCode: "FAIL" });
  }
});
// 로그아웃 API
app.post("/users/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  res.json({ retCode: "OK" });
});
// 게시판 목록 API
app.get("/users/board/:page", async (req, res) => {
  const page = Number(req.params.page);
  const conn = await getConnection();
  //JSON 날짜타입 때문에 들고 올 때 변환해서 들고올거임
  const { metaData, rows } = await conn.execute(
    `SELECT
        b.board_no,
        b.title,
        b.content,
        u.user_name AS writer,
        TO_CHAR(b.created_at, 'YYYY-MM-DD') AS created_at,
        b.views
    FROM board b
    JOIN users u
    ON b.writer = u.user_id
    ORDER BY b.board_no DESC
    OFFSET (:page - 1) * 10 ROWS
    FETCH NEXT 10 ROWS ONLY
`,
    { page },
  );
  // const json = JSON.stringify(rows); //객체 ->json문자열.
  res.json(rows); //응답처리
  conn.close();
});

// 게시글 상세 API
app.get("/board/detail/:no", async (req, res) => {
  // URL에서 글 번호 가져오기
  const no = Number(req.params.no);

  // 현재 로그인한 사용자 아이디 가져오기 (세션에 저장된 값)
  // 로그인 안했으면 null
  const loginUser = req.session.user?.user_id || null;

  // DB 연결
  const conn = await getConnection();

  // 해당 글 번호의 게시글 조회
  const { rows } = await conn.execute(
    `SELECT
      b.board_no,
      b.title,
      b.content,
      b.writer,
      u.user_name AS writer,
      TO_CHAR(b.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
      b.views
    FROM board b
    JOIN users u
    ON b.writer = u.user_id
    WHERE b.board_no = :no`,
    { no }, // :no 자리에 들어갈 값
    //배열로 받으면 귀찮아져서 컬럼명을 key로 갖는 객체 배열 형태로 받기
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );

  // 조회 결과는 배열이므로 첫 번째 글 꺼내기
  const post = rows[0];

  // 글이 존재하지 않을 경우 404
  if (!post) {
    return res.status(404).json({ message: "글 없음" });
  }

  // 현재 로그인한 사용자와 글 작성자 비교
  // 같으면 true, 다르면 false
  const isOwner = loginUser === post.WRITER;

  // 게시글 정보 + 작성자 여부를 하나의 객체로 묶어서 전송
  res.json({ post, isOwner });

  conn.close();
});

// 글 작성 API
app.post("/board", async (req, res) => {});

// 글 수정 API
app.put("/board/:no", async (req, res) => {
  // Day 3에 작성 예정 (시간 있으면)
});

// 글 삭제 API (논리 삭제)
app.delete("/board/:no", async (req, res) => {
  // Day 3에 작성 예정 (시간 있으면)
});

// ===========================
// 서버 시작
// ===========================

app.listen(PORT, () => {
  console.log(`🚀 서버 실행: http://localhost:${PORT}`);
  console.log(`📄 회원가입: http://localhost:${PORT}/html/register.html`);
  testConnection();
});
