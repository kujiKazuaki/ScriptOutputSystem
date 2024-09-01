/**
 * 台本の数だけ、ランダムにボイスリストから１つのボイスが選ばれ、配列に格納させる関数
 * @param {Array.<Object.<string, string>>} voiceDataset - ボイスの値が入っている連想配列
 * @param {Array.<Array.<string>>} linesList - 台本の値が入っている2次元配列 ex - [[ '>1\n鳥に髪食われとるやんけ！！' ], , ,]
 * @return {Array.<Array.<string>>} - ボイスとセリフが格納された2次元配列 ex) [["ボイス", "セリフ"],,,]
 */
function getVoiceAndScriptList(voiceDataset, voiceRegex, linesList) {
  /**
   * 性別ごとのリストを合計３つ作成する
   * @type {Array.<string>} allVoiceList - 全てのボイスリスト
   * @type {Array.<string>} maleVoiceList - 男性ボイスリスト
   * @type {Array.<string>} femaleVoiceList - 女性ボイスリスト
   */
  const allVoiceList = voiceDataset.all.map(item => item.name);
  const maleVoiceList = voiceDataset.male.map(item => item.name);
  const femaleVoiceList = voiceDataset.female.map(item => item.name);

  /**
   * 性別ごとの正規表現リスト
   */
  const { maleRegexList, femaleRegexList } = voiceRegex;

  /**
   * 台本の内容からボイス名を決める
   * その際、ボイスが前の台本と被ったりスレッドと返信のボイスが同一になったりしないように決める
   */
  let lastVoice = null
  const result = linesList.map(([line]) => {
    // 台本から性別を判断
    const gender = Helper_determineGender(maleRegexList, femaleRegexList, line)
    // 性別ボイスリストを判断する
    const tarVoiceList = Helper_judgeGenderList(gender, allVoiceList, maleVoiceList, femaleVoiceList)

    let voice // 現在のボイス名を格納する変数
    do {
      const randomVoiceIndex = Math.floor(Math.random() * tarVoiceList.length)
      voice = tarVoiceList[randomVoiceIndex]
    } while ((voice === lastVoice && line.startsWith(">>")) || (voice === lastVoice))

    lastVoice = voice // 選択されたvoiceを更新
    return [voice, line] // ボイスとセリフのペアを返す
  })
  return result
}

/**
 * 台本から性別を判断する関数
 * @param {Array.<string>} maleRegexList - 男性の正規表現リスト
 * @param {Array.<string>} femaleVoiceList - 女性の正規表現リスト
 * @param {string} line - 台本にあたる文章
 * @return {string} - 性別
 */
function Helper_determineGender(maleRegexList, femaleVoiceList, line) {
  // 行が指定された正規表現リストのいずれかにマッチするかを判定する関数
  const judge_str = (regex_list, line, pass) => {
    if (pass) return true;

    // 正規表現リストをビルドインのRegExpオブジェクトに変換してからマッチングを実行
    return regex_list.some(pattern => {
      // パターンが文字列の場合、正規表現としてビルド
      const regex = new RegExp(pattern.slice(1, -1)); // スラッシュを取り除いてRegExpオブジェクトを生成
      return regex.test(line); // 行が正規表現にマッチするかをチェック
    });
  }

  let pass1 = false
  let pass2 = false
  /**
   * ジャッジ処理
   */
  // 男性リストでヒットするか判断
  pass1 = judge_str(maleRegexList, line, pass1)
  if (pass1 === undefined) { pass1 = false }
  pass1 = judge_str(maleRegexList, line, pass1)
  if (pass1 === undefined) { pass1 = false }

  // 女性リストでヒットするか判断
  pass2 = judge_str(femaleVoiceList, line, pass2)
  if (pass2 === undefined) { pass2 = false }
  pass2 = judge_str(femaleVoiceList, line, pass2)
  if (pass2 === undefined) { pass2 = false }
  /**
   * pass1変数とpass2変数の値から性別を判断する
   */
  if (pass1 && !pass2) { // 男性passのみtrueの場合
    return "male";
  } else if (!pass1 && pass2) { // 女性passのみtrueの場合
    return "female";
  } else { // 両方trueもしくはfalseの場合
    return "unknown";
  }
}

/**
 * 引数『gender』の値からボイスリストを決定する関数
 * @param {string} gender - 性別に関する情報が記載された値 ex) "male" or "female" or "unknown"
 * @param {Array.<Object.<string>>} voiceList - 男女混合ボイスの値が入っているリスト
 * @param {Array.<string>} maleVoiceList - 男性ボイスの値が入っているリスト
 * @param {Array.<string>} femaleVoiceList -  女性ボイスの値が入っているリスト
 */
function Helper_judgeGenderList(gender, allVoiceList, maleVoiceList, femaleVoiceList) {
  switch (gender) {
    case "male":
      return maleVoiceList
    case "female":
      return femaleVoiceList
    case "unknown":
      return allVoiceList
    default:
      console.error("gender", gender)
      throw new Error("judge_GenderList関数にて、genderの値は開発者が意図しているものではありません")
  }
}