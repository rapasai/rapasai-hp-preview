RapasAI Lab｜note記事情報の自動同期

■ 初回だけ必要なもの
この一式に含まれる次のファイルをGitHubへ反映します。
・scripts/sync_note_rss.py
・.github/workflows/sync-note-rss.yml
・index.html
・articles.json

■ 以後の記事追加
新しい記事を追加するときは、articles.json に新しい1件を追加してGitHubへアップロードします。
最低限必要な項目は次のとおりです。

{
  "id": 23,
  "title": "",
  "category": "series",
  "cover": "",
  "url": "https://note.com/rapasai_lab/n/xxxxxxxxxxxx",
  "recommendation": "",
  "published_at": "",
  "series_order": 11
}

GitHubへarticles.jsonをアップロードすると、GitHub Actionsが自動実行されます。
noteのRSSから次の情報を取得してarticles.jsonへ反映します。
・正式タイトル
・公開日
・表紙画像URL

category、series_order、recommendation、recommendation_slotなど、HP側の編集情報は変更しません。

■ RSS反映が遅れた場合
新記事がまだnote RSSに出ていない場合、その回の自動同期はFAILになり、articles.jsonは自動変更しません。
ワークフローは1時間ごとにも実行されるため、RSSへ反映された後に自動で再試行します。
既存記事は壊しません。

■ 古い記事がRSS25件の外へ出た場合
すでに正式タイトル・公開日・表紙URLが保存済みなら、その記事はそのまま保持します。
記事総数を21件、22件などに固定していません。

■ HP表示
未同期でtitle/published_at/coverが不足している記事は、同期完了までHPの本棚には表示しません。
既存の記事は通常どおり表示されます。
