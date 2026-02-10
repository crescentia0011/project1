const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { getConnection } = require("./server");

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
// 정상 작동 확인
// if (result.rowsAffected) {
//   res.json({ retCode: "OK" }); //{"retCode":"OK"}
// } else {
//   res.json({ retCode: "NG" }); //{"retCode":"NG"}
// }

// 회원가입 API
app.post("/users/register", async (req, res) => {
  // Day 1 오전에 작성 예정
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
      `SELECT password FROM users WHERE user_id = :user_id`,
      { user_id },
    );

    console.log("DB 조회 결과:", result.rows);
    // 3️⃣ 아이디가 DB에 없는 경우
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
// 로그아웃 API
app.post("/users/logout", (req, res) => {
  // Day 1 오후에 작성 예정
});

// 게시판 목록 API
app.get("/board/:page", async (req, res) => {
  // Day 2에 작성 예정
});

// 게시글 상세 API
app.get("/board/detail/:no", async (req, res) => {
  // Day 2에 작성 예정
});

// 글 작성 API
app.post("/board", async (req, res) => {
  // Day 2에 작성 예정
});

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
