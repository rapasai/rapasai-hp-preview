RapasAI Lab｜note記事情報の同期・第9回追加手順

【土台】
rapasai_series_04_08_pdf_covers_update.zip を正本として修正しました。
第0回〜第8回を削除せず、第9回を「連載｜AI産業の資金と利益」に追加しています。
既存の第4〜8回の表紙を変更していません。

【記事の登録】
・articles.json：21本（従来20本＋第9回1本）。
・第9回：id=21、category=series、series_order=9。
・画像：assets/covers/article_21.webp。
・記事URL：https://note.com/rapasai_lab/n/n3531a5020a48
・連載の本棚は第0回→第9回の順。連載以外は従来の仕様のままです。

【noteとの照合】
・GitHub Actions「note記事情報の同期」を実行すると、https://note.com/rapasai_lab/rss の記事情報を取得します。
・既存URLと一致する記事のタイトル、投稿日、見出し画像URLを照合して articles.json を更新します。
・記事のカテゴリ、連載順、POP、おすすめ枠は変更しません。
・RSSにない記事は削除しません。未登録記事は note_pending_articles.json に候補として出力します。
・RSSが取得できない場合は更新を行わず、実行失敗として記録します。
・自動実行は日本時間の午前9時24分、午後3時24分、午後9時24分、午前3時24分です（UTCで指定）。
・GitHubでの実RSS取得成功は、GitHub Actionsの実行ログで確認してください。ローカルテストの成功とは区別してください。

【GitHubへの反映】
1. 本ZIPを解凍し、内側のファイル・フォルダを既存リポジトリの同じ場所へアップロードします。
2. .github/workflows/ と scripts/ を含めてください。隠しフォルダ .github がアップロード対象に含まれるか確認します。
3. Settings > Actions > General の Workflow permissions に Contents への書込み許可が必要です。
4. Actions > note記事情報の同期 > Run workflow で初回実行します。
5. 実行結果と articles.json の更新を確認します。

【注意】
・Pagesの公開方法（Deploy from a branch）を勝手に変更する必要はありません。
・GitHub Actions側のRSS実接続・更新は未検証です。
・現在のHPは file:// 直開きでは記事データの fetch が制限される場合があります。HTTPで確認してください。
・日本語ファイル名はUTF-8のZIPエントリとして格納しています。文字化けを英語名への置換で回避しません。
