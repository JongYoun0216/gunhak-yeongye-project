// NLP 정답 판정 — 정확 일치 → Fuzzy Matching(Levenshtein) 순서로 검증한다.
// (호국실록_프로젝트_기능_구현_분석.md §E-2. RapidFuzz와 동일한 편집거리 아이디어를
//  의존성 없이 TypeScript로 구현. OCR 인식 오탈자까지 허용 판정하기 위함)

export function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,!?'"“”‘’·\-_/\\]/g, '');
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + (a[i - 1] === b[j - 1] ? 0 : 1), // substitution
      );
      prev = temp;
    }
  }
  return dp[n];
}

export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length === 0 && nb.length === 0) return 1;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length, 1);
  return 1 - dist / maxLen;
}

const FUZZY_THRESHOLD = 0.82;

export function isAnswerCorrect(userInput: string, expected: string): boolean {
  const na = normalize(userInput);
  const nb = normalize(expected);
  if (na.length === 0) return false;
  if (na === nb) return true;
  return similarity(userInput, expected) >= FUZZY_THRESHOLD;
}
