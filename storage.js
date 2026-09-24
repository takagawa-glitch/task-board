// タスクの永続化をこのファイルに閉じ込める。
// 将来サーバー保存に切り替える場合は、load / save の中身だけを差し替える。
const TaskStorage = (() => {
  const STORAGE_KEY = "task-board:tasks";

  // localStorage はプライベートモードなどで使えないことがあるため、常に try/catch で包む
  const isValidTask = (task) =>
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "number" &&
    typeof task.title === "string" &&
    typeof task.done === "boolean";

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // 壊れたデータが混ざっていても画面が落ちないように、妥当な要素だけ残す
      return parsed.filter(isValidTask);
    } catch (error) {
      console.warn("タスクの読み込みに失敗しました", error);
      return [];
    }
  };

  const save = (tasks) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn("タスクの保存に失敗しました", error);
    }
  };

  return { load, save };
})();
