/**
 * 対象文字が半角か全角かを判断する関数
 * @param {string} char - 単一文字
 * @return {boolean} - 半角であればtrueを返す
 */
function isHalfWidth(char) {
  const code = char.charCodeAt(0) // 文字のUnicodeポイントを取得
  /**
   * Unicodeポイントが半角文字の範囲にあるかを判定
   */
  const judge1 = (0x0020 <= code && code <= 0x7E) // 半角文字に該当する範囲１
  const judge2 = (0xFF61 <= code && code <= 0xFF9F) // 半角文字に該当する範囲２
  return judge1 || judge2
}