/**
 * リストを分割する関数
 * @param {Array.<Array.<string>>} scriptList - ボイスと台本が格納されたリスト
 * @return {Array.<Array.<string>>} - 分割後のリスト
 */
function splitScript(scriptDataset, scriptList) {
  if (scriptDataset.mode === '台本を分けずに出力する') { return scriptList }

  const lineMaxChars = Number(scriptDataset.lineMaxChars);
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
        const newData = [voice, ""]
        RESULT.push(newData)
        counter = 0
      }
    }
  }
  return RESULT
}