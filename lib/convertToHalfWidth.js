/**
 * 指定された文字列内の全角数字を半角数字に変換します。
 * 数字以外の文字が含まれている場合は undefined を返します。
 *
 * @param {string} text - 変換したい文字列。
 * @return {string|undefined} 半角数字に変換された文字列、または undefined。
 */
function convertToHalfWidth(text) {
  // 全角数字を半角数字に変換するためのマッピング
  const fullWidthNumbers = '０１２３４５６７８９．';
  const halfWidthNumbers = '0123456789.';

  // 文字列を配列に分解し、各文字をチェック
  const chars = [...text];
  for (let char of chars) {
    if (!fullWidthNumbers.includes(char) && !halfWidthNumbers.includes(char)) {
      return undefined; // 数字以外の文字が含まれている場合は undefined を返す
    }
  }

  // 変換処理
  return chars.map(char => {
    // 現在の文字が全角数字のどれかをチェック
    const index = fullWidthNumbers.indexOf(char);
    // もし全角数字であれば、対応する半角数字に置き換え、それ以外の場合はそのままの文字を返す
    return index !== -1 ? halfWidthNumbers[index] : char;
  }).join(''); // 配列を再び文字列に結合して返す
}