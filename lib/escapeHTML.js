/**
 * 指定された文字列内の特殊文字をHTMLエスケープする関数
 *
 * @param {string} text - エスケープ対象の文字列
 * @return {string} エスケープされた文字列
 */
function TEST_escapeHTML() {
  const data = escapeHTML("   4   ");
  console.log(data)
}
function escapeHTML(text) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  // 正規表現を使って文字列内の特殊文字を対応するエスケープ文字に置き換える
  return text.replace(/[&<>"']/g, char => escapeMap[char]);
}