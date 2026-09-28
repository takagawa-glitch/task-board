# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

task-board は、タスクを登録・管理するタスクボード(カンバン形式)のWebアプリケーションです。

- 技術スタック: React 18(CDN 読み込み)+ JSX / CSS。詳細は「技術スタック」を参照。
- 現状: タスクの追加・編集・完了切替・削除と、localStorage への保存が実装済みです。
- 位置づけ: `claludeCodeStudy` 配下の学習用プロジェクトです(同階層の `quiz-app` と同じ構成方針)。

## デプロイ先

https://takagawa-glitch.github.io/task-board/

GitHub Pages で `main` ブランチのルートを公開しています。`main` に push すると自動で再公開されます(手順と注意点は「公開(GitHub Pages)」を参照)。

## 技術スタック

| 分類 | 採用技術 | 補足 |
|---|---|---|
| UI ライブラリ | React 18.3.1 / ReactDOM 18.3.1 | unpkg から UMD の本番ビルドを読み込む。`React` / `ReactDOM` はグローバル変数として使う |
| JSX の変換 | @babel/standalone 7.29.9 | `type="text/babel"` のスクリプトをブラウザ上で変換する |
| 言語 | JavaScript(ES2015 以降)+ JSX | TypeScript は使わない。`import` / `export` も使わない(ファイルは `<script>` タグで順番に読み込む) |
| 状態管理 | React フック(`useState` / `useEffect` / `useRef`) | Redux などの状態管理ライブラリは使わない |
| スタイル | 素の CSS(`style.css`) | 色は `:root` の CSS カスタムプロパティ(`--accent` など)で管理する。CSS フレームワークは使わない |
| 永続化 | ブラウザの `localStorage` | `storage.js` の `TaskStorage` 経由でのみ読み書きする |
| ホスティング | GitHub Pages | ビルドなしでリポジトリのファイルをそのまま配信する |
| ビルド・パッケージ管理 | なし | `package.json` や `node_modules` は置かない |

## 開発コマンド

ビルドツールやパッケージマネージャ(package.json 等)は導入していません。React と Babel を CDN から読み込み、JSX はブラウザ上で変換しています。

- **簡易サーバー経由で開く必要があります**: `npx serve .` または `python -m http.server` を実行し、表示された URL にアクセスします。
  - `index.html` をファイルとして直接開くと、`app.jsx` の読み込みがブラウザの制限でブロックされ、画面が空になります。
- lint/test の仕組みは未整備です。導入した場合は、実行コマンドをこのファイルに追記してください。

## 公開(GitHub Pages)

- `main` ブランチのルートをそのまま公開する(Settings → Pages → Deploy from a branch → `main` / `/ (root)`)。URL は「デプロイ先」を参照
- サイトは `/task-board/` というサブパスで配信されるため、ファイルの参照は必ず相対パス(`style.css` など)で書く。`/style.css` のような先頭スラッシュは使わない
- CDN のバージョンは固定する(`react@18.3.1` / `react-dom@18.3.1` / `@babel/standalone@7.29.9`)。更新するときはローカルで動作確認してから変える
- `.nojekyll` は Jekyll 処理を無効にするためのファイルなので消さない
- ブラウザ上で JSX を変換しているため、コンソールに Babel の「本番ではプリコンパイルを」という警告が出るが、ビルドなし構成の仕様として許容している

## アーキテクチャ

```
index.html   画面の骨組みと CDN(React / ReactDOM / Babel standalone)の読み込み
README.md    アプリの説明と GitHub Pages の公開手順
.nojekyll    GitHub Pages で Jekyll 処理を無効にする空ファイル
storage.js   localStorage への保存・読み込み(app.jsx より先に読み込む)
app.jsx      React コンポーネント一式(type="text/babel" で読み込まれる)
style.css    スタイル定義
```

- コンポーネント構成: `App`(状態を保持)→ `TaskForm`(入力・追加)/ `TaskItem`(1件の表示・編集・完了切替・削除)
- タスクは `{ id, title, done }` のオブジェクト配列として `App` の `useState` で保持する
- 状態を更新する関数(`addTask` / `editTask` / `toggleTask` / `deleteTask`)は `App` に集約し、子コンポーネントには props で渡す
- 「編集中かどうか」「入力途中の文字列」のような1件内だけの UI 状態は `TaskItem` 自身の `useState` で持つ(タスクデータには含めない)
  - 編集は「編集」ボタンで開始し、Enter/保存で確定、Escape/キャンセルで破棄する。空欄では保存できない
- 状態は必ず新しい配列・オブジェクトを作って更新する(`map` / `filter` / スプレッド構文)。直接書き換えない
- 完了済みの表示は `task-done` クラスの付与で切り替え、色やスタイルの指定は CSS 側に置く
- 永続化は `storage.js` の `TaskStorage`(`load` / `save`)に閉じ込める。キーは `task-board:tasks`
  - `localStorage` はプライベートモードなどで失敗しうるため、読み書きは必ず `try/catch` で包む
  - 読み込み時は配列かどうかと各要素の型を検証し、壊れたデータは捨てる(画面を落とさない)
  - サーバー保存に切り替える場合は `load` / `save` の中身だけを差し替える
- タスクの読み込みは `useState` の初期化関数で1度だけ行い、保存は `tasks` を依存配列に持つ `useEffect` で行う
- ID は `createId()` で採番する(同一ミリ秒の連続追加でも重複しないようにしている)
- 今後の拡張方針:
  - 「未着手 / 進行中 / 完了」のような列(レーン)に広げる場合、列の定義は定数として一箇所にまとめる
  - React 以外の外部ライブラリには依存しない

## コンポーネントの命名規約

現在のコードで使っている命名に合わせる。新しく追加するものも同じ規則で名付ける。

### コンポーネント

- 名前は PascalCase の名詞にする。タスクに関わる部品は `Task` + 役割(`TaskItem` / `TaskForm`)、ルートは `App`
  - 例: 列(レーン)を追加するなら `TaskColumn`、一覧なら `TaskList`
- `function TaskItem(...) { ... }` の関数宣言で書き、直前に役割を1行コメントで書く
- 子コンポーネントを先、それを使う親を後に書く(現在は `TaskItem` → `TaskForm` → `App` の順)

### props

- データは名詞で渡す(`task`)
- 親の処理を呼ぶコールバックは `on` + 動詞(`onAdd` / `onEdit` / `onToggle` / `onDelete`)
- 引数で分割代入して受け取る(`function TaskItem({ task, onToggle, onEdit, onDelete })`)

### 関数

| 種類 | 規則 | 例 |
|---|---|---|
| `App` の状態更新関数 | 動詞 + `Task` | `addTask` / `editTask` / `toggleTask` / `deleteTask` |
| props への受け渡し | `on` + 動詞 に 状態更新関数を渡す | `onEdit={editTask}` |
| DOM イベントのハンドラ | `handle` + イベント名 | `handleSubmit` / `handleKeyDown` |
| コンポーネント内の UI 操作 | 動詞 + 名詞 | `startEditing` / `cancelEditing` |
| ユーティリティ | 動詞で始める camelCase | `createId` |
| 真偽値を返す判定 | `is` + 内容 | `isValidTask` |

### state・ref・変数

- state は `[値, set値]` の組にする(`[tasks, setTasks]` / `[draft, setDraft]`)
- UI 状態の真偽値は `is` を付ける(`isEditing`)。入力途中の値は `draft`
- ref は `〇〇Ref`(`inputRef`)
- 計算で求められる値は state にせず、描画のたびに計算する(`doneCount`)
- タスクデータの項目名(`id` / `title` / `done`)は localStorage に保存済みのデータと対応しているため変えない。完了フラグも `isDone` ではなく `done` のままにする

### コンポーネント以外

- 関数群をまとめたオブジェクトは PascalCase の名詞、メソッドは動詞(`TaskStorage.load` / `TaskStorage.save`)
- 定数は UPPER_SNAKE_CASE(`STORAGE_KEY`)
- localStorage のキーは `task-board:<名前>`(`task-board:tasks`)
- ファイル名は小文字。JSX を含むファイルは `.jsx`、含まないファイルは `.js`

### CSS クラス名

- kebab-case で、`<対象>-<部位>` の形にする(`task-title` / `task-label` / `board-title`)
- ボタンは `<動作>-button`(`add-button` / `edit-button` / `save-button` / `cancel-button` / `delete-button`)
- 入力欄は `<用途>-input`、フォームは `<用途>-form`(`task-input` / `edit-input` / `task-form` / `edit-form`)
- 状態による見た目の違いは、基本クラスに `<対象>-<状態>` を追加して表す(`task task-done` / `task task-editing`)
- 色はクラスに直接書かず、`:root` のカスタムプロパティを参照する

## Git運用ルール

**コードを変更するたびに、コミットして GitHub にプッシュします。** 変更をローカルに溜めず、動作確認できた単位で必ずリモートへ反映してください。

手順:

1. 変更内容を確認する: `git status` / `git diff`
2. 変更をステージする: `git add <変更したファイル>`
3. コミットする: `git commit -m "<変更内容がわかる日本語のメッセージ>"`
4. GitHub にプッシュする: `git push`

運用上の取り決め:

- 1つの変更(機能追加・修正)ごとに1コミットを基本とし、複数の目的を1コミットに混ぜない
- コミットメッセージは「何を変えたか」が後から読んでわかるように書く(例: `タスク追加フォームを実装`)
- 作業を中断する場合も、中断前にコミットとプッシュを済ませる
- `.env` などの秘密情報を含むファイルはコミットしない。`.gitignore` に追加して管理する

### リポジトリ情報

- リモート: https://github.com/takagawa-glitch/task-board (公開リポジトリ)
- ブランチ: `main` のみ。`origin/main` を追跡済みなので、`git push` だけでリモートへ反映される
- `main` は GitHub Pages の公開元でもあるため、push した内容はそのまま公開サイトに反映される。動作確認してから push する
- この PC には `gh` コマンドが入っていない。GitHub の設定変更(Pages など)は GitHub の Web 画面で行う

### 別の PC で作業を始める場合

```bash
git clone https://github.com/takagawa-glitch/task-board.git
cd task-board
python -m http.server 8000
```
