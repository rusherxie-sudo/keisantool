import { kataToHira, hiraToKata } from './moji.js';

const HEPBURN = {
  きゃ:'kya',きゅ:'kyu',きょ:'kyo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',
  しゃ:'sha',しゅ:'shu',しょ:'sho',じゃ:'ja',じゅ:'ju',じょ:'jo',
  ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',
  ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',びゃ:'bya',びゅ:'byu',びょ:'byo',
  ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',みゃ:'mya',みゅ:'myu',みょ:'myo',
  りゃ:'rya',りゅ:'ryu',りょ:'ryo',てぃ:'ti',でぃ:'di',ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',
  うぃ:'wi',うぇ:'we',うぉ:'wo',ゔぁ:'va',ゔぃ:'vi',ゔぇ:'ve',ゔぉ:'vo',
  あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',
  が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',
  ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',
  だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',
  は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',
  ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',
  や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'wo',ん:'n',
  ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o',ゔ:'vu',ゎ:'wa',
};

const KUNREI = {
  し:'si',ち:'ti',つ:'tu',ふ:'hu',じ:'zi',ぢ:'zi',づ:'zu',
  しゃ:'sya',しゅ:'syu',しょ:'syo',じゃ:'zya',じゅ:'zyu',じょ:'zyo',
  ちゃ:'tya',ちゅ:'tyu',ちょ:'tyo',
};

function lastVowel(value) {
  const match = String(value).match(/[aeiou](?!.*[aeiou])/);
  return match?.[0] ?? '';
}

export function kanaToRomaji(value, system = 'hepburn') {
  const text = kataToHira(String(value ?? ''));
  let output = '';
  let geminate = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === 'っ') {
      geminate = true;
      continue;
    }
    if (char === 'ー') {
      output += lastVowel(output);
      continue;
    }
    const pair = text.slice(index, index + 2);
    const table = system === 'kunrei' ? { ...HEPBURN, ...KUNREI } : HEPBURN;
    let roman = table[pair];
    if (roman) index += 1;
    else roman = table[char];
    if (!roman) {
      output += char;
      geminate = false;
      continue;
    }
    if (geminate && /^[bcdfghjklmpqrstvwxyz]/.test(roman)) roman = roman[0] + roman;
    output += roman;
    geminate = false;
  }
  return output;
}

const ROMAJI = {};
for (const [kana, roman] of Object.entries(HEPBURN)) if (kana !== 'ん' && !ROMAJI[roman]) ROMAJI[roman] = kana;
for (const [kana, roman] of Object.entries(KUNREI)) if (!ROMAJI[roman]) ROMAJI[roman] = kana;
Object.assign(ROMAJI, { si:'し', ti:'ち', tu:'つ', hu:'ふ', zi:'じ', sya:'しゃ', syu:'しゅ', syo:'しょ',
  tya:'ちゃ', tyu:'ちゅ', tyo:'ちょ', cchi:'っち', tch:'っち' });
const MAX_ROMAJI = Math.max(...Object.keys(ROMAJI).map((key) => key.length));

export function romajiToHiragana(value) {
  const text = String(value ?? '').toLowerCase()
    .replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ē/g, 'ee').replace(/ō/g, 'ou');
  let output = '';
  for (let index = 0; index < text.length;) {
    const char = text[index];
    if (char === '-') {
      output += 'ー';
      index += 1;
      continue;
    }
    if (char === 'n' && text[index + 1] === "'") {
      output += 'ん';
      index += 2;
      continue;
    }
    if (char === 'n' && (index + 1 === text.length || !/[aeiouy]/.test(text[index + 1]))) {
      output += 'ん';
      index += 1;
      continue;
    }
    if (/[^aeiou]/.test(char) && char !== 'n' && text[index + 1] === char) {
      output += 'っ';
      index += 1;
      continue;
    }
    let matched = false;
    for (let length = MAX_ROMAJI; length > 0; length -= 1) {
      const token = text.slice(index, index + length);
      if (!ROMAJI[token]) continue;
      output += ROMAJI[token];
      index += length;
      matched = true;
      break;
    }
    if (!matched) {
      output += char;
      index += 1;
    }
  }
  return output;
}

export function romajiToKatakana(value) {
  return hiraToKata(romajiToHiragana(value));
}
