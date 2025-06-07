// --- 設定値 ---
const ITEM_HEIGHT = 50; // 各アイテムの固定高さ (px)
const TOTAL_ITEMS = 10000; // 生成するアイテムの総数 (仮想的な数)
const OVERSCAN = 2; // 表示領域の上下にどれだけ余分にレンダリングするか（ちらつき防止）

// --- DOM要素の取得 ---
const scrollableContainer = document.getElementById("scrollable-container");
const virtualScrollTrack = document.getElementById("virtual-scroll-track");

// --- 仮想スクロール関連の変数 ---
let visibleItemsCount = 0; // 現在表示できるアイテムの数
let startIndex = 0; // 現在表示されているアイテムの開始インデックス
let endIndex = 0; // 現在表示されているアイテムの終了インデックス

// --- データの準備 (実際にはAPIから取得するなど) ---
const allItemsData = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: `item-${i}`,
  content: `バーチャルアイテム ${i + 1}`,
}));

// --- ヘルパー関数 ---

// スクロール可能な「仮想的な」コンテンツ全体の高さを設定
function setVirtualScrollHeight() {
  virtualScrollTrack.style.height = `${TOTAL_ITEMS * ITEM_HEIGHT}px`;
}

// レンダリングするアイテムの範囲を計算し、DOMを更新する
function renderItems() {
  const scrollTop = scrollableContainer.scrollTop;

  // 表示すべきアイテムの開始インデックスを計算
  startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);

  // 終了インデックスを計算
  endIndex = Math.min(
    TOTAL_ITEMS - 1,
    startIndex + visibleItemsCount + OVERSCAN * 2
  );

  // 現在表示されているアイテムを管理するためのSet
  const currentItems = new Set();

  // 既存のアイテムを更新またはマーク
  const existingItems = scrollableContainer.querySelectorAll(".item");
  existingItems.forEach((item) => {
    const itemIndex = parseInt(item.dataset.index, 10); // データ属性からインデックスを取得
    if (itemIndex >= startIndex && itemIndex <= endIndex) {
      currentItems.add(itemIndex); // 表示範囲内のアイテムをマーク
    } else {
      item.remove(); // 表示範囲外のアイテムは削除
    }
  });

  // 新しく表示すべきアイテムを追加
  for (let i = startIndex; i <= endIndex; i++) {
    if (!currentItems.has(i)) {
      // まだDOMにないアイテムのみ追加
      const itemData = allItemsData[i];
      const itemElement = document.createElement("div");
      itemElement.className = "item";
      itemElement.dataset.index = i; // インデックスをデータ属性として保存
      itemElement.textContent = itemData.content;
      itemElement.style.top = `${i * ITEM_HEIGHT}px`; // アイテムの絶対位置を設定
      scrollableContainer.appendChild(itemElement);
    }
  }
}

// ウィンドウサイズ変更時に表示アイテム数を再計算
function calculateVisibleItems() {
  const containerHeight = scrollableContainer.clientHeight;
  visibleItemsCount = Math.ceil(containerHeight / ITEM_HEIGHT);
  setVirtualScrollHeight(); // 仮想高さを設定
  renderItems(); // 再計算後、アイテムを再レンダリング
}

// --- イベントリスナー ---

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  calculateVisibleItems();
});

// ウィンドウのリサイズで表示アイテム数を更新
window.addEventListener("resize", calculateVisibleItems);

// スクロールイベントでアイテムを更新
// requestAnimationFrameでラップすることで、描画パフォーマンスを最適化
let animationFrameId = null;
scrollableContainer.addEventListener("scroll", () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(renderItems);
});
