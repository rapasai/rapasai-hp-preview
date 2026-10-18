RapasAI Lab｜note RSS同期版

【今回の実装】
・公開サイトの見た目、記事のカテゴリ、POP、おすすめ枠を変更しない。
・GitHub Actionsがnote公式RSSを1日4回（日本時間9:24、15:24、21:24、翌3:24頃）取得する。
・RSSで配信される既登録記事について、正式タイトル・公開日・表紙URLをarticles.jsonへ反映する。
・RSS取得失敗、XML不正の場合は処理が失敗してarticles.jsonを書き換えない。
・RSS最新25件より古い記事は既存データを保持する。
・RSSに現れた未登録記事はnote_pending_articles.jsonに一覧化する。勝手にカテゴリを決めて公開しない。
・おすすめ1番目はarticles.jsonの最新記事（自動）、2番目は手動選定、3番目はNanohana記事の固定枠を維持。

【GitHubアップロード】
ZIPを解凍し、中のファイルとフォルダをリポジトリ直下へアップロードする。
隠しフォルダ「.github」を必ず含めること。
GitHubのSettings → Pages → Build and deployment → Sourceを「GitHub Actions」に変更する（重要）。
GitHubのSettings → Actions → General → Workflow permissionsを「Read and write permissions」にする（必要な場合）。
GitHubのActionsタブから「Synchronize note article metadata」→「Run workflow」を実行。
実行ログに「RSS記事=..., 更新記事=...」が出て、「Deploy website」も成功すればRSS実取得と公開反映の検証が完了。
失敗した場合、note_pending_articles.jsonもarticles.jsonも自動書換えしない。

【新しい記事の追加】
RSSから未登録記事のURL・正式タイトル・画像・公開日は取得するが、カテゴリとPOPはRSSで決められない。
新記事を本棚へ追加するにはnote_pending_articles.jsonの情報を確認し、articles.jsonにカテゴリなどを登録する。
すでに第9回はarticles.jsonに登録済み。

【検証済みと未検証】
テスト用RSSでのXML解析、更新、欠損記事保持、未登録記事の分離、失敗判定を実行済み。
note.comの実RSS取得はこの実行環境から制限されており、GitHub Actions実行が必要。
公開時のnote表紙は画像URLを直接参照するため、note側で配信URLが変われば次回RSS同期時に更新される。
