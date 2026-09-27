const { useState, useEffect, useRef } = React;

// 同じミリ秒に連続で追加しても ID が重複しないようにする
let lastId = 0;
const createId = () => {
  const now = Date.now();
  lastId = now > lastId ? now : lastId + 1;
  return lastId;
};

// タスク1件分の表示(チェックボックス・タイトル・編集/削除ボタン)
// 編集中かどうかと入力途中の文字列はこのタスク内だけの UI 状態なので、ここで持つ
function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  // 編集モードに入ったら入力欄にフォーカスし、文字列を全選択する
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(task.title);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(task.title);
    setIsEditing(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed === "") return;
    if (trimmed !== task.title) onEdit(task.id, trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") cancelEditing();
  };

  if (isEditing) {
    return (
      <li className="task task-editing">
        <form className="edit-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="edit-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="タスク名を編集"
          />
          <button
            type="submit"
            className="save-button"
            disabled={draft.trim() === ""}
          >
            保存
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={cancelEditing}
          >
            キャンセル
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={task.done ? "task task-done" : "task"}>
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span className="task-title">{task.title}</span>
      </label>
      <div className="task-actions">
        <button
          type="button"
          className="edit-button"
          onClick={startEditing}
          aria-label={`「${task.title}」を編集`}
        >
          編集
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(task.id)}
          aria-label={`「${task.title}」を削除`}
        >
          削除
        </button>
      </div>
    </li>
  );
}

// タスク追加フォーム
function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed === "") return;
    onAdd(trimmed);
    setTitle("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="タスクを入力"
      />
      <button type="submit" className="add-button">追加</button>
    </form>
  );
}

function App() {
  // タスクは { id, title, done } のオブジェクト配列で保持する
  // 初期値は localStorage から読み込む(初回描画時に1度だけ実行される)
  const [tasks, setTasks] = useState(() => {
    const saved = TaskStorage.load();
    // 保存済みの ID と重複しないように採番の起点を合わせる
    saved.forEach((task) => {
      if (task.id > lastId) lastId = task.id;
    });
    return saved;
  });

  // タスクが変わるたびに保存する
  useEffect(() => {
    TaskStorage.save(tasks);
  }, [tasks]);

  const addTask = (title) => {
    setTasks((prev) => [
      ...prev,
      { id: createId(), title, done: false },
    ]);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const editTask = (id, title) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title } : task))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="board">
      <h1 className="board-title">タスクボード</h1>
      <TaskForm onAdd={addTask} />

      {tasks.length === 0 ? (
        <p className="empty-message">タスクはまだありません。</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      )}

      <p className="task-count">
        完了 {doneCount} / 全体 {tasks.length}
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
