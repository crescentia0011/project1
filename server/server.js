const oracledb = require("oracledb");

// Oracle DB 출력 포맷 설정 (객체 형태로)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

// DB 연결 함수
async function getConnection() {
  return await oracledb.getConnection({
    user: "scott",
    password: "tiger",
    connectString: "192.168.0.51:1521/xe",
  });
}

module.exports = { getConnection, oracledb };
