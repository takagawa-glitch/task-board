# タスクボード

タスクの追加・編集・完了切替・削除ができる、シンプルなタスクボードです。
React(CDN 読み込み)で作っていて、ビルドは不要です。タスクはブラウザの localStorage に保存されます。

公開ページ: https://takagawa-glitch.github.io/task-board/

## 機能

- テキスト入力でタスクを追加
- 「編集」ボタンでタスク名を変更(Enter で保存 / Esc でキャンセル)
- チェックボックスで完了・未完了を切り替え(完了済みはグレー表示)
- タスクの削除
- リロードしてもタスクが消えない(localStorage に保存)

## ローカルで動かす

`index.html` を直接開くと画面が真っ白になるため、簡易サーバー経由で開きます。

```bash
python -m http.server 8000
# または
npx serve .
```

ブラウザで http://127.0.0.1:8000/ を開きます。

## GitHub Pages での公開手順

ビルドが不要なので、リポジトリの `main` ブランチのファイルをそのまま公開できます。

1. GitHub のリポジトリページで **Settings → Pages** を開く
2. **Build and deployment** の **Source** で「Deploy from a branch」を選ぶ
3. **Branch** で `main` と `/ (root)` を選んで **Save**
4. 1〜2分待つと https://takagawa-glitch.github.io/task-board/ で公開される

以降は `main` に push するたびに自動で再公開されます。

## 注意

- タスクは閲覧しているブラウザの中だけに保存されます。別のパソコンやブラウザとは共有されません
- ページの表示には unpkg.com(CDN)から React と Babel を読み込むため、インターネット接続が必要です
