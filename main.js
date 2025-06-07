// --- 設定値 ---
const ITEM_HEIGHT = 50;
const TOTAL_ITEMS = 10000;
const OVERSCAN = 2;

// --- DOM要素 ---
const container = document.getElementById("scrollable-container");
const track = document.getElementById("virtual-scroll-track");

// --- データ ---
const data = Array.from(
  { length: TOTAL_ITEMS },
  (_, i) => `バーチャルアイテム ${i + 1}`
);

// --- アイテム管理 ---
const renderedItems = new Map(); // index -> DOM要素 のマップ

// --- メイン処理 ---
function render() {
  const scrollTop = container.scrollTop;
  const visibleCount = Math.ceil(container.clientHeight / ITEM_HEIGHT);
  const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const end = Math.min(TOTAL_ITEMS - 1, start + visibleCount + OVERSCAN * 2);

  // 不要なアイテムの削除
  for (const [index, item] of renderedItems) {
    if (index < start || index > end) {
      item.remove();
      renderedItems.delete(index);
    }
  }

  // 新しいアイテムの追加
  for (let i = start; i <= end; i++) {
    if (!renderedItems.has(i)) {
      const item = document.createElement("div");
      item.className = "item";
      item.dataset.index = i;
      item.textContent = data[i];
      item.style.top = `${i * ITEM_HEIGHT}px`;

      // 次に大きいインデックスのアイテムを見つけて、その前に挿入
      let nextElement = null;
      const sortedIndices = Array.from(renderedItems.keys()).sort(
        (a, b) => a - b
      );
      for (const index of sortedIndices) {
        if (index > i) {
          nextElement = renderedItems.get(index);
          break;
        }
      }

      container.insertBefore(item, nextElement);
      renderedItems.set(i, item);
    }
  }
}

function init() {
  track.style.height = `${TOTAL_ITEMS * ITEM_HEIGHT}px`;
  render();
}

// --- イベント ---
let frameId;
container.addEventListener("scroll", () => {
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(render);
});

window.addEventListener("resize", render);
document.addEventListener("DOMContentLoaded", init);
