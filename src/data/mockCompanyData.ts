// Mock 데이터: /api/v1/master/RM_55C 응답
export const MOCK_MASTER_DATA = {
  company: {
    cust_code: "RM_55C ",
    company_name: "흥진레미콘주식회사",
    address: "경상북도 경주시 천북면 산업로 4773-10",
    representative: "이광운",
    business_no: "505-81-72615",
    business_type: "제조업",
    business_item: "레미콘",
    tel_1: "054-774-1336",
    fax: "054-741-6564",
    email_1: "hungjinremi@naver.com",
    remark_1: "신우계열사 부서별 아이디 개인사용(김상민요청)",
  },
  users: [
    {
      user_id: "100700", user_name: "김성철", password: "0324", position: "영업이사",
      authority_code: 186, last_login_at: "2026-03-31T00:00:00", phone_number: "01066652767",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "HJ_Johap.exe", program_label: "조합/세무" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "3588", user_name: "전화종", password: "3588", position: null,
      authority_code: 120, last_login_at: null, phone_number: null,
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
      ],
    },
    {
      user_id: "6472", user_name: "박상무", password: "6472", position: null,
      authority_code: 10, last_login_at: "2026-04-06T11:37:00", phone_number: null,
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "RM55CChulha.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "RM55CYeongeop.exe", program_label: "영업" },
        { program_no: 9, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae.exe", user_program_path: ".\\", user_program_name: "RM55CGwanjae.exe", program_label: "GPS/RT" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "관제관리", user_name: null, password: "1234", position: null,
      authority_code: 10, last_login_at: "2025-04-21T00:00:00", phone_number: null,
      programs: [
        { program_no: 9, program_path: "D:\\Prog\\GPS", program_name: "GPS.exe", user_program_path: ".\\", user_program_name: "GPS.exe", program_label: "GPS/RT" },
      ],
    },
    {
      user_id: "구관제", user_name: null, password: "1234", position: null,
      authority_code: 10, last_login_at: null, phone_number: null,
      programs: [
        { program_no: 9, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae.exe", user_program_path: ".\\", user_program_name: "Gwanjae.exe", program_label: "GPS/RT" },
      ],
    },
    {
      user_id: "시험실", user_name: "시험실", password: "1234", position: "품질",
      authority_code: 6, last_login_at: "2026-04-06T00:00:00", phone_number: null,
      programs: [
        { program_no: 5, program_path: "D:\\Prog\\RM_55C", program_name: "QC.exe", user_program_path: ".\\", user_program_name: "QC_55C.exe", program_label: "품질" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "MES.exe", user_program_path: ".\\", user_program_name: "55CMES.exe", program_label: "MIS" },
      ],
    },
    {
      user_id: "흥진관리", user_name: null, password: "3553", position: null,
      authority_code: 8, last_login_at: "2026-04-06T00:00:00", phone_number: null,
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha_55C.exe", program_label: "출하" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae_All.exe", user_program_path: ".\\", user_program_name: "55CGwanjae_All.exe", program_label: "MIS" },
        { program_no: 9, program_path: "D:\\Prog\\GPS", program_name: "GPS.exe", user_program_path: ".\\", user_program_name: "GPS.exe", program_label: "GPS/RT" },
      ],
    },
    {
      user_id: "chj1238", user_name: "최현재", password: "chj1139", position: "상무",
      authority_code: 172, last_login_at: "2026-04-06T14:29:00", phone_number: "01038211139",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "HJ_Johap.exe", program_label: "조합/세무" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "ddr1990", user_name: "이광연", password: "lky4703", position: "이사",
      authority_code: 219, last_login_at: "2026-04-06T00:00:00", phone_number: "01094934646",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "Johap.exe", program_label: "조합/세무" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "ditl2000", user_name: "이재성", password: "chaeho0512", position: "영화대표",
      authority_code: 70, last_login_at: "2026-04-06T16:06:00", phone_number: "01082518523",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "gary5078", user_name: "윤우진", password: "1234", position: null,
      authority_code: 147, last_login_at: "2026-04-06T15:09:00", phone_number: "01072405078",
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "55CChulha.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "55CYeongeop.exe", program_label: "영업" },
        { program_no: 5, program_path: "D:\\Prog\\RM_55C", program_name: "Qc.exe", user_program_path: ".\\", user_program_name: "55CQc.exe", program_label: "품질" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "55CJohap.exe", program_label: "조합/세무" },
        { program_no: 9, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae.exe", user_program_path: ".\\", user_program_name: "55CGwanjae.exe", program_label: "GPS/RT" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "hellioos", user_name: "김상민", password: "1384", position: "이사",
      authority_code: 103, last_login_at: "2026-04-06T15:09:00", phone_number: null,
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "55CYeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "HJ_Johap.exe", program_label: "조합/세무" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "MES.exe", user_program_path: ".\\", user_program_name: "MES_55C.exe", program_label: "MIS" },
      ],
    },
    {
      user_id: "heo0729", user_name: "허열", password: "ok0728", position: "이사",
      authority_code: 31, last_login_at: "2026-04-06T07:57:00", phone_number: "01063891801",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "RM_55CYeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "hhs624", user_name: "하창섭", password: "0624", position: "본부장",
      authority_code: 142, last_login_at: "2023-11-07T00:00:00", phone_number: null,
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 5, program_path: "D:\\Prog\\RM_55C", program_name: "Qc.exe", user_program_path: ".\\", user_program_name: "Qc.exe", program_label: "품질" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "Johap.exe", program_label: "조합/세무" },
      ],
    },
    {
      user_id: "hmu802", user_name: "하민욱", password: "2477", position: "대리",
      authority_code: 190, last_login_at: "2026-04-06T16:18:00", phone_number: "01054092477",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "hydralisk", user_name: "윤건호", password: "12345", position: "관리부대리",
      authority_code: 63, last_login_at: "2026-03-26T00:00:00", phone_number: "01062479335",
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 9, program_path: "D:\\Prog\\GPS", program_name: "RT.exe", user_program_path: ".\\", user_program_name: "RT.exe", program_label: "GPS/RT" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "kgh5940", user_name: "김규환", password: "kgh5941", position: null,
      authority_code: 74, last_login_at: "2026-04-03T12:27:00", phone_number: null,
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "55CYeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "king", user_name: "윤영식", password: "1212", position: "대표이사",
      authority_code: 1, last_login_at: "2026-03-30T00:00:00", phone_number: null,
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha_55C.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop_55C.exe", program_label: "영업" },
        { program_no: 4, program_path: "D:\\Prog\\RM_55C", program_name: "Jajae.exe", user_program_path: ".\\", user_program_name: "Jajae_55C.exe", program_label: "자재" },
        { program_no: 5, program_path: "D:\\Prog\\RM_55C", program_name: "QC.exe", user_program_path: ".\\", user_program_name: "QC_55C.exe", program_label: "품질" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "Johap_55C.exe", program_label: "조합/세무" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "MES.exe", user_program_path: ".\\", user_program_name: "55CMES.exe", program_label: "MIS" },
        { program_no: 9, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae.exe", user_program_path: ".\\", user_program_name: "Gwanjae_55C.exe", program_label: "GPS/RT" },
      ],
    },
    {
      user_id: "kjs9009", user_name: "김정수", password: "9009", position: "전무",
      authority_code: 198, last_login_at: "2026-04-06T10:23:00", phone_number: null,
      programs: [
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "ksh0417", user_name: "김소희", password: "1357", position: "사원",
      authority_code: 61, last_login_at: "2025-05-12T00:00:00", phone_number: null,
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\RM_55C", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "MES.exe", user_program_path: ".\\", user_program_name: "MES_55C.exe", program_label: "MIS" },
      ],
    },
    {
      user_id: "ojy5424", user_name: "오주엽", password: "1234", position: null,
      authority_code: 34, last_login_at: "2026-04-06T17:23:00", phone_number: "01097075424",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "pjm9907", user_name: "박주미", password: "1212", position: "과장",
      authority_code: 10, last_login_at: "2026-04-06T00:00:00", phone_number: "01097372540",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "Johap.exe", program_label: "조합/세무" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "ppark2468", user_name: "박재범", password: "6303", position: "영업부장",
      authority_code: 174, last_login_at: "2026-04-06T13:26:00", phone_number: "01026546303",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "rmafmd12", user_name: "최민경", password: "rmafmd12", position: "과장",
      authority_code: 80, last_login_at: "2026-04-01T00:00:00", phone_number: "01094349357",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "55CYeongeop.exe", program_label: "영업" },
        { program_no: 6, program_path: "D:\\Prog\\RM_500", program_name: "Johap_Full_Case_3.exe", user_program_path: ".\\", user_program_name: "55CJohap.exe", program_label: "조합/세무" },
        { program_no: 100, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "기타(100)" },
      ],
    },
    {
      user_id: "RT", user_name: null, password: "3553", position: null,
      authority_code: 10, last_login_at: "2026-04-06T00:00:00", phone_number: null,
      programs: [
        { program_no: 9, program_path: "D:\\Prog\\GPS", program_name: "RT.exe", user_program_path: ".\\", user_program_name: "RT.exe", program_label: "GPS/RT" },
      ],
    },
    {
      user_id: "soon1130", user_name: "손재옥", password: "1130soon", position: "관리",
      authority_code: 50, last_login_at: "2026-04-03T09:42:00", phone_number: "01035951104",
      programs: [
        { program_no: 2, program_path: "D:\\Prog\\rm_55c", program_name: "Chulha.exe", user_program_path: ".\\", user_program_name: "Chulha_55C.exe", program_label: "출하" },
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 7, program_path: "D:\\Prog\\RM_55C", program_name: "MES.exe", user_program_path: ".\\", user_program_name: "55CMES.exe", program_label: "MIS" },
        { program_no: 9, program_path: "D:\\Prog\\RM_55C", program_name: "Gwanjae.exe", user_program_path: ".\\", user_program_name: "Gwanjae.exe", program_label: "GPS/RT" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "wj1234", user_name: "류성낙", password: "1234", position: "영업차장",
      authority_code: 165, last_login_at: "2026-04-06T06:33:00", phone_number: "01085028284",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 5, program_path: "D:\\Prog\\RM_55C", program_name: "Qc.exe", user_program_path: ".\\", user_program_name: "Qc.exe", program_label: "품질" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "yoobd66", user_name: "유병득", password: "0000", position: null,
      authority_code: 164, last_login_at: "2026-04-06T13:29:00", phone_number: null,
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "RM55CYeongeop.exe", program_label: "영업" },
      ],
    },
    {
      user_id: "youing27", user_name: "이광운", password: "5860", position: "대표이사",
      authority_code: 210, last_login_at: "2026-04-06T16:26:00", phone_number: "01056478779",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "younghwa", user_name: "윤영창", password: "1234", position: null,
      authority_code: 10, last_login_at: "2026-04-06T16:04:00", phone_number: "01085051927",
      programs: [
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "yswoon", user_name: "양승운", password: "9123", position: "대표이사",
      authority_code: 220, last_login_at: "2026-04-06T10:04:00", phone_number: "01052879123",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
    {
      user_id: "yun1925", user_name: "윤충현", password: "3699", position: "이사",
      authority_code: 167, last_login_at: "2026-04-06T07:57:00", phone_number: "01071691128",
      programs: [
        { program_no: 3, program_path: "D:\\Prog\\RM_55C", program_name: "Yeongeop.exe", user_program_path: ".\\", user_program_name: "Yeongeop.exe", program_label: "영업" },
        { program_no: 10, program_path: "D:\\Prog\\RM_55C", program_name: null, user_program_path: ".\\", user_program_name: null, program_label: "모바일" },
      ],
    },
  ],
};

// Mock 데이터: /api/v1/affiliates/RM_55C 응답
export const MOCK_AFFILIATES_DATA = {
  affiliates: [
    { cust_code: "RM_550", sangho: "신우레미콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_55A", sangho: "신우레미콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_55B", sangho: "영화레미콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_55C", sangho: "흥진레미콘주식회사", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_55D", sangho: "영진레미콘아스콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_5K3", sangho: "신우레미콘아스콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_5K4", sangho: "우진레미콘아스콘(주)", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_5P2", sangho: "신우레미콘1공장", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_5P5", sangho: "신우레미콘산업주식회사", group_cust: "RM_550", program_cust: null },
    { cust_code: "RM_907", sangho: "신아레미콘(주)", group_cust: "RM_550", program_cust: null },
  ],
};
