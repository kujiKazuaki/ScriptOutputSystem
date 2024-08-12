function TEST_split_Script() {
  createScriptSystem()
}
/**
 * リストを分割する関数
 * @param {Array.<Array.<string>>} scriptList - ボイスと台本が格納されたリスト
 * @return {Array.<Array.<string>>} - 分割後のリスト
 */
function splitScript(scriptDataset, scriptList) {
  // { mode: '台本を分けて出力する', lineMaxChars: 60, maxLines: 4, halfwidth: 0.75 }
  if (scriptDataset.mode === '台本を分けずに出力する') { return scriptList }

  const lineMaxChars = Number(scriptDataset.lineMaxChars);
  const maxLines = Number(scriptDataset.maxLines);
  const halfwidth = Number(scriptDataset.halfwidth);

  const RESULT = []
  const fullWidth = 1;
  for (let i = 0; i < scriptList.length; i++) {
    const [voice, script] = scriptList[i]
    let counter = 0
    RESULT.push(scriptList[i])

    for (let v = 0; v < script.length; v++) {
      const char = script.charAt(v)
      const charType = isHalfWidth(char) ? '半角' : '全角';
      if (charType === "半角") {
        counter += halfwidth
      } else {
        counter += fullWidth
      }
      if (counter > lineMaxChars) {
        // console.warn("分割文字数上限値に達しました", "counter =>", counter, "script", script)
        const newData = [voice, ""]
        RESULT.push(newData)
        counter = 0
      }
    }
  }
  return RESULT
}

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