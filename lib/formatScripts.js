function TEST_formatScripts() {
  // parserAniman(animanURL = "https://animanch.com/archives/20987585.html")
  parserAniman(animanURL = "https://animanch.com/archives/20946628.html")
}
/**
 * 全てのコメントのリストを、台本に読み込んでもらう形に整理する関数
 * @param {Array.<string>} allComments - スクレイピングしたコメント
 * @return {Array.<Object.<string, string>>} - コメント情報が連想配列として格納されたリスト
 * 
 * ### Example
 * return - [{ number: '10',
 *             name: '名無しのあにまんch',
 *             date: '2024/02/16(金) 23:30:19',
 *             comment: '10: 名無しのあにまんch 2024/02/16(金) 23:30:19\nメトーデさんのカウンター魔法なに？' },
 *           { 
 *              number: '11',
 *              name: '名無しのあにまんch',
 *              date: '2024/02/16(金) 23:30:31',
 *              comment: '11: 名無しのあにまんch 2024/02/16(金) 23:30:31\n「うんとこしょ どっこいしょ 」ところがフリーレンはぬけません' 
 *           },,,]
 */
function formatScripts(headerList, commentList) {
  if (headerList.length !== commentList.length) {
    /**
     * コメント部分に動画を張り付けている場合、コメントにあたるタグが取得できないことがある
     * これに対応するための処理をこのブロック内で行う
     */
    // headerの各要素の末尾が日時+閉じタグではない場合、それ以降の文章をコメントにする
    // ex - 00:11:27</span><br /><br />かっこいい
    headerList.map((item, index) => {
      const spanEndIndex = item.lastIndexOf('</span>');
      if (spanEndIndex === -1 || spanEndIndex !== item.length - 7) {
        console.log('true', spanEndIndex)
        const additionalText = item.slice(spanEndIndex + 7).trim();

        commentList.splice(index, 0, additionalText);
      }
    });
  }

  if (headerList.length !== commentList.length) {
    console.error('headerListとcommentListの要素数が一致しません');
    console.error('headerList：', headerList.length);
    console.error('commentList：', commentList.length);
    throw new Error('headerListとcommentListの要素数が一致しません');
  }

  /** 戻り値 */
  const formatScriptsList = []

  commentList.forEach((comment, i) => { // 各コメントを加工したうえで、内容ごとに連想配列に格納し、プッシュする
    // HTMLタグを削除
    const header = removeHtml(headerList[i], 'header');
    const resComment = removeHtml(comment, 'comment');
    const combinedText = `${header}\n${resComment}`;

    console.log('combinedText', combinedText)

    const isLongText = (text) => text.length > 500;
    if (!isLongText(combinedText)) { // コメントが500文字以下の場合の処理
      // コメント情報から『スレッド番号』『スレッド名』『スレッド日』を取得
      const commentInfo = getCommentInfo(combinedText)
      formatScriptsList.push(commentInfo)
    }
  })
  return formatScriptsList
}

/**
 * コメント情報から『スレッド番号』『スレッド名』『スレッド日』『コメント本文』を取得する関数
 * @param {string} comment - コメント文字列(HTMLタグは除去済み)
 * @return {Object.<string, <number, string>>} - {'number': スレッド番号, 'name': 'スレッド名', "date": '日時', 'comment': 'コメント'}
 * 
 * ### Note
 * ・1行目は「197: 名無しのあにまんch  2024/02/17(土) 00:30:48」のようなフォーマット
 * ・2行目はコメントもしくは「>>数字」or「>数字」のみの行と想定する
 * 
 * ### Example
 * comment - `190: 名無しのあにまんch 2024/02/17(土) 00:27:06
 *            ガーゴイルの戦闘マジで盛られすぎて草`
 * return - { number: '190',
 *            name: '名無しのあにまんch',
 *            date: '2024/02/17(土) 00:27:06' 
 *          }
 */
function getCommentInfo(comment) {
  // コメント情報に当たる部分の抽出
  const lines = comment.split('\n');
  const firstLine = lines[0]; // 1行目を取得

  /** @return {Array} ex - [ '56:', '名無しのあにまんch', '2024年07月28日', '23:49:57', 'ID:g3MDI1NTI' ]  */
  const headerList = firstLine.split(' ');
  console.warn('headerList', headerList);

  // 2行目以降のコメント部分を結合して1つの文字列にする
  const refineComment = lines.slice(1).join('\n').trim();

  return {
    "number": headerList[0],
    "name": headerList[1],
    "date": `${headerList[2]} ${headerList[3]}`,
    'comment': refineComment,
  };
}

/**
 * リストをレスの番号に応じてソートする関数
 * @param {Array.<Object>} formatedScripts - コメント情報が連想配列として格納されたリスト(formatScripts関数の戻り値)
 * @return {Array<Array<string>>} - 整理されたスレッドコメントのリスト（各コメントは配列内の要素として含まれる）
 * 
 * ### Note
 * ・各スレッドの最初のコメントを検出し、それに基づいてテーマごとにまとめる
 * ・スレッドのテーマが変わるたびに「『次のスレッドへの反応集を紹介します』」というコメントを挿入する
 */
function sortResponsesByNumber(formatedScripts) {
  const RESULT = []
  const firstNum = 1 // スレッドの新しいテーマの最初の番号（通常は1）
  const themeList = [] // 1つのテーマ内のコメントを一時的に格納する配列

  formatedScripts.forEach((item, index) => {
    const { number, comment } = item;
    const isNewTheme = number === firstNum && index !== 0;
    if (isNewTheme) {
      RESULT.push(...themeList, ["『次のスレッドへの反応集を紹介します』"]);
      themeList = [];
    }
    themeList.push([comment]);
  })
  // 最後のテーマを結果に追加
  if (themeList.length > 0) {
    RESULT.push(...themeList);
  }
  return RESULT;
}