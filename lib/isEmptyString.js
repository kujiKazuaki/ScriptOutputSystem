/**
 * 指定された文字列が空文字のみで構成されているかを判断する関数
 * ※\n,\t,\v,\r も対象
 *
 * @param {string} text - チェック対象の文字列
 * @return {boolean} 文字列が空文字のみで構成されている場合はtrue, それ以外の場合はfalse
 */
function isEmptyString(text) {
  try {
    // 正規表現を使用して、文字列が空文字（スペース、タブ、改行など）だけで構成されているかをチェック
    return text.trim().length === 0;
  } catch (e) {
    return false;
  }
}