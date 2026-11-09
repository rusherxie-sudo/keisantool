const birthNumberNames = {
  1: '独立',
  2: '調和',
  3: '創造',
  4: '安定',
  5: '自由',
  6: '愛',
  7: '探求',
  8: '豊か',
  9: '慈悲',
};

const birthNumberTraits = {
  1: {
    positive: ['リーダーシップ', '独立性', '勇気', '創意性', '自信'],
    negative: ['頑固', '独断', 'プライド高い', '支配的'],
    description: '独立や先頭に立つことをテーマにした数字です。自分で決めたい場面を振り返る、占い上の解釈として読めます。',
  },
  2: {
    positive: ['協調性', '感受性', '優しさ', '直感力', '調整力'],
    negative: ['優柔不断', '依存心', '過敏', '相手ばかり気にする'],
    description: '調和や協力をテーマにした数字です。相手との距離感や、自分の希望の伝え方を考える材料にできます。',
  },
  3: {
    positive: ['創造性', '表現力', '社交的', '楽観的', '明るい'],
    negative: ['おしゃべり', '注意力散漫', '感情的', '浅はか'],
    description: '創造や表現をテーマにした数字です。好きな表現方法や、人と楽しみを共有する場面に結び付けて読む解釈です。',
  },
  4: {
    positive: ['責任感', '秩序', '堅実', '勤勉', '信頼できる'],
    negative: ['頑固', '柔軟性がない', '過度に慎重', '退屈'],
    description: '安定や秩序をテーマにした数字です。計画や日々の積み重ねを振り返る読み方ができます。',
  },
  5: {
    positive: ['自由奔放', '好奇心', '柔軟性', '冒険心', '多才'],
    negative: ['不安定', '束縛を嫌う', 'コミットしにくい', '衝動的'],
    description: '自由や変化をテーマにした数字です。新しい経験と、続けたい習慣とのバランスを考える解釈です。',
  },
  6: {
    positive: ['愛情深い', '献身的', '責任感', '美的センス', '家庭的'],
    negative: ['干渉的', '過保護', '自己犠牲的', '完璧主義'],
    description: '愛情や世話をテーマにした数字です。誰かを助けたい気持ちと、自分の負担について考える材料にできます。',
  },
  7: {
    positive: ['知的', '分析的', '直感力', '精神的', '内省的'],
    negative: ['孤立しがち', '懐疑的', '完璧主義', '人と距離を置く'],
    description: '探求や内省をテーマにした数字です。一人で考える時間や、深く知りたいことに結び付けて読む解釈です。',
  },
  8: {
    positive: ['野心的', '実務的', '組織力', 'リーダーシップ', '成功したい'],
    negative: ['権力欲', '冷酷', '物質主義', '傲慢'],
    description: '目標や実務をテーマにした数字です。組織力や成功を測定する結果ではなく、取り組み方を振り返るための解釈です。',
  },
  9: {
    positive: ['慈悲深い', '寛容', '理想主義', '創造的', '人を助けたい'],
    negative: ['夢想家', '現実離れ', '自己犠牲的', '落ち込みやすい'],
    description: '慈悲や理想をテーマにした数字です。周囲や社会との関わりについて考える、占い上の読み方です。',
  },
};

function sumDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

function reduceToSingle(n) {
  while (n >= 10) {
    n = sumDigits(n);
  }
  return n;
}

function isValidDate(year, month, day) {
  if (year < 1 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return day <= (isLeap ? 29 : 28);
  }

  return day <= daysInMonth[month - 1];
}

export function calcSuumijutsu(year, month, day) {
  const numYear = Number(year);
  const numMonth = Number(month);
  const numDay = Number(day);

  if (!isValidDate(numYear, numMonth, numDay)) {
    return {
      valid: false,
      birthNumber: 0,
      birthNumberName: '',
      traits: null,
    };
  }

  const total = numYear + numMonth + numDay;
  const birthNumber = reduceToSingle(total);

  return {
    valid: true,
    birthNumber,
    birthNumberName: birthNumberNames[birthNumber] || '',
    traits: birthNumberTraits[birthNumber] || null,
  };
}