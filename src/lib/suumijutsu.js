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
    description: 'リーダーシップがあり、自分の道を切り開く力があります。独立性が強く、自分の信念を貫きます。',
  },
  2: {
    positive: ['協調性', '感受性', '優しさ', '直感力', '調整力'],
    negative: ['優柔不断', '依存心', '過敏', '相手ばかり気にする'],
    description: '人との調和を重視し、協調性があります。感受性が豊かで、他人の気持ちをよく理解します。',
  },
  3: {
    positive: ['創造性', '表現力', '社交的', '楽観的', '明るい'],
    negative: ['おしゃべり', '注意力散漫', '感情的', '浅はか'],
    description: '創造性が豊かで、表現したいという欲求が強いです。社交的で周りを明るくします。',
  },
  4: {
    positive: ['責任感', '秩序', '堅実', '勤勉', '信頼できる'],
    negative: ['頑固', '柔軟性がない', '過度に慎重', '退屈'],
    description: '責任感が強く、計画的に物事を進めます。安定した基盤を築くことが得意です。',
  },
  5: {
    positive: ['自由奔放', '好奇心', '柔軟性', '冒険心', '多才'],
    negative: ['不安定', '束縛を嫌う', 'コミットしにくい', '衝動的'],
    description: '自由を愛し、変化を求めます。好奇心が旺盛で、様々なことに挑戦したいと思います。',
  },
  6: {
    positive: ['愛情深い', '献身的', '責任感', '美的センス', '家庭的'],
    negative: ['干渉的', '過保護', '自己犠牲的', '完璧主義'],
    description: '愛と奉仕を重視します。人を助けることに喜びを感じ、家庭や社会に貢献したいと思います。',
  },
  7: {
    positive: ['知的', '分析的', '直感力', '精神的', '内省的'],
    negative: ['孤立しがち', '懐疑的', '完璧主義', '人と距離を置く'],
    description: '知的な探求心が強く、真理を追求します。内省的で精神的な深みがあります。',
  },
  8: {
    positive: ['野心的', '実務的', '組織力', 'リーダーシップ', '成功したい'],
    negative: ['権力欲', '冷酷', '物質主義', '傲慢'],
    description: '野心があり、目標達成に向けて努力します。組織力があり、大きなプロジェクトを成功させることが得意です。',
  },
  9: {
    positive: ['慈悲深い', '寛容', '理想主義', '創造的', '人を助けたい'],
    negative: ['夢想家', '現実離れ', '自己犠牲的', '落ち込みやすい'],
    description: '慈悲深く、他人の幸せを願います。人類全体の幸福を考え、貢献したいと思います。',
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