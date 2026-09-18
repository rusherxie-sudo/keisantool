// 2026年国税庁賞与税額表。minimumsは円、税率は百分率の1/1000。
// XLS全21行×扶養8列を公式PDFと独立に照合（2026-09-18）。
export const BONUS_TABLE_SOURCE = 'https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/01.htm';
export const BONUS_RATES_2026 = [
  {
    "rateMilliPercent": 0,
    "minimums": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "rateMilliPercent": 2042,
    "minimums": [
      82000,
      107000,
      143000,
      181000,
      218000,
      251000,
      284000,
      317000
    ]
  },
  {
    "rateMilliPercent": 4084,
    "minimums": [
      94000,
      250000,
      276000,
      300000,
      300000,
      304000,
      343000,
      383000
    ]
  },
  {
    "rateMilliPercent": 6126,
    "minimums": [
      260000,
      289000,
      321000,
      354000,
      387000,
      412000,
      438000,
      463000
    ]
  },
  {
    "rateMilliPercent": 8168,
    "minimums": [
      309000,
      346000,
      377000,
      405000,
      431000,
      457000,
      483000,
      508000
    ]
  },
  {
    "rateMilliPercent": 10210,
    "minimums": [
      342000,
      373000,
      400000,
      424000,
      452000,
      479000,
      505000,
      529000
    ]
  },
  {
    "rateMilliPercent": 12252,
    "minimums": [
      372000,
      401000,
      426000,
      452000,
      477000,
      503000,
      527000,
      552000
    ]
  },
  {
    "rateMilliPercent": 14294,
    "minimums": [
      402000,
      430000,
      457000,
      484000,
      509000,
      531000,
      553000,
      578000
    ]
  },
  {
    "rateMilliPercent": 16336,
    "minimums": [
      433000,
      463000,
      492000,
      517000,
      540000,
      564000,
      589000,
      614000
    ]
  },
  {
    "rateMilliPercent": 18378,
    "minimums": [
      520000,
      520000,
      525000,
      550000,
      577000,
      604000,
      630000,
      657000
    ]
  },
  {
    "rateMilliPercent": 20420,
    "minimums": [
      605000,
      621000,
      636000,
      651000,
      666000,
      681000,
      697000,
      708000
    ]
  },
  {
    "rateMilliPercent": 22462,
    "minimums": [
      684000,
      705000,
      728000,
      751000,
      774000,
      798000,
      821000,
      845000
    ]
  },
  {
    "rateMilliPercent": 24504,
    "minimums": [
      715000,
      739000,
      764000,
      788000,
      813000,
      838000,
      862000,
      887000
    ]
  },
  {
    "rateMilliPercent": 26546,
    "minimums": [
      752000,
      778000,
      804000,
      830000,
      856000,
      881000,
      907000,
      933000
    ]
  },
  {
    "rateMilliPercent": 28588,
    "minimums": [
      795000,
      821000,
      848000,
      876000,
      903000,
      930000,
      957000,
      985000
    ]
  },
  {
    "rateMilliPercent": 30630,
    "minimums": [
      854000,
      882000,
      910000,
      938000,
      966000,
      994000,
      1022000,
      1051000
    ]
  },
  {
    "rateMilliPercent": 32672,
    "minimums": [
      922000,
      952000,
      983000,
      1013000,
      1044000,
      1074000,
      1104000,
      1135000
    ]
  },
  {
    "rateMilliPercent": 35735,
    "minimums": [
      1318000,
      1342000,
      1367000,
      1391000,
      1416000,
      1440000,
      1464000,
      1489000
    ]
  },
  {
    "rateMilliPercent": 38798,
    "minimums": [
      1521000,
      1526000,
      1526000,
      1538000,
      1555000,
      1555000,
      1555000,
      1583000
    ]
  },
  {
    "rateMilliPercent": 41861,
    "minimums": [
      2621000,
      2645000,
      2669000,
      2693000,
      2716000,
      2740000,
      2764000,
      2788000
    ]
  },
  {
    "rateMilliPercent": 45945,
    "minimums": [
      3495000,
      3527000,
      3559000,
      3590000,
      3622000,
      3654000,
      3685000,
      3717000
    ]
  }
];
export const BONUS_OTSU_2026 = [
  {
    "minimum": 0,
    "rateMilliPercent": 10210
  },
  {
    "minimum": 224000,
    "rateMilliPercent": 20420
  },
  {
    "minimum": 295000,
    "rateMilliPercent": 30630
  },
  {
    "minimum": 527000,
    "rateMilliPercent": 38798
  },
  {
    "minimum": 1118000,
    "rateMilliPercent": 45945
  }
];
