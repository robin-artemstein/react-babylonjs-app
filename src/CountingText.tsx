import React, { useState, useRef, useCallback } from 'react';

/**
 * 數值增減器組件 (NumberStepper)
 * 特點：支援點擊單次增減、長按連續增減
 */
const NumberStepper: React.FC = () => {
  // 1. 定義狀態：文字輸入框的值，預設為 0
  const [value, setValue] = useState<number>(0);
  
  // 2. 定義 Ref：用來儲存 setInterval 的 ID，這樣才能在不同函式間清除定時器
  // 使用 Ref 是因為更新 Ref 不會觸發組件重新渲染，適合存放這種 side effect 的 ID
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 核心邏輯：改變數值
   * @param delta 增量（+1 或 -1）
   */
  const adjustValue = useCallback((delta: number) => {
    setValue((prev) => prev + delta);
  }, []);

  /**
   * 開始連續觸發
   * @param delta 增量
   */
  const startAdjusting = (delta: number) => {
    // 先執行一次，確保「點擊」動作也能立即生效
    adjustValue(delta);

    // 如果已經有計時器在跑，先清除它（防禦性編程）
    stopAdjusting();

    // 設定定時器，每 100 毫秒觸發一次（可根據需求調整速度）
    timerRef.current = setInterval(() => {
      adjustValue(delta);
    }, 100);
  };

  /**
   * 停止觸發
   * 當滑鼠放開或離開按鈕範圍時，必須清除定時器
   */
  const stopAdjusting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 處理手動輸入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setValue(isNaN(newValue) ? 0 : newValue);
  };
  
  console.log("Current counting text is " + value + ".") ;

  return (
    <div className="flex justify-center my-2">
      {/* 1. 單行文字輸入框 */}
      <input className="h-[25px] w-[70px] px-2 border border-green-700 font-medium text-green-700 text-sm bg-green-100" type="text" value={value} onChange={handleInputChange}
      />

      {/* 2. 減號按鈕 (-) */}
      <button className="h-[25px] w-[20px] border border-green-700" onMouseDown={() => startAdjusting(-1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} aria-label="Decrease">
        <svg className="stroke-green-700" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* 2. 加號按鈕 (+) */}
      <button className="h-[25px] w-[20px] border border-green-700" onMouseDown={() => startAdjusting(1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} aria-label="Increase">
        <svg className="stroke-green-700" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
};

export default NumberStepper;
