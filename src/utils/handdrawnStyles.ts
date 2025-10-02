/**
 * 手繪風格樣式生成器
 * 基於節點ID生成一致的隨機樣式，確保每次渲染都相同
 */

// 簡單的hash函數，將字符串轉換為數字
export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 轉換為32位整數
  }
  return Math.abs(hash);
}

// 基於種子的偽隨機數生成器
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 生成範圍內的隨機數
function randomInRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

// 生成節點的手繪樣式
export function getHanddrawnStyle(nodeId: string, nodeType: 'product' | 'concept' | 'generated') {
  const hash = hashCode(nodeId);
  
  // 為不同屬性使用不同的種子
  const rotateSeed = hash + 1;
  const borderRadiusSeed = hash + 2;
  const borderWidthSeed = hash + 3;
  const skewSeed = hash + 4;

  // 生成傾斜角度 (更微妙的 -2度到2度)
  const rotateAngle = randomInRange(rotateSeed, -2, 2);
  
  // 生成不規則邊框圓角
  const borderRadius = {
    topLeft: Math.floor(randomInRange(borderRadiusSeed, 85, 95)),
    topRight: Math.floor(randomInRange(borderRadiusSeed + 1, 3, 10)),
    bottomRight: Math.floor(randomInRange(borderRadiusSeed + 2, 88, 98)),
    bottomLeft: Math.floor(randomInRange(borderRadiusSeed + 3, 2, 8))
  };

  // 生成邊框寬度變化
  const borderWidth = {
    top: randomInRange(borderWidthSeed, 1.5, 3),
    right: randomInRange(borderWidthSeed + 1, 2, 4),
    bottom: randomInRange(borderWidthSeed + 2, 1.5, 3),
    left: randomInRange(borderWidthSeed + 3, 3, 6)
  };

  // 生成更微妙的傾斜效果 (-0.5度到0.5度)
  const skewX = randomInRange(skewSeed, -0.5, 0.5);


  // 根據節點類型選擇顏色類名
  const colorClass = {
    product: 'ink-box-yellow',
    concept: 'ink-box-green', 
    generated: 'ink-box-blue'
  }[nodeType];

  return {
    className: colorClass,
    style: {
      transform: `rotate(${rotateAngle}deg) skewX(${skewX}deg)`,
      borderRadius: `${borderRadius.topLeft}% ${borderRadius.topRight}% ${borderRadius.bottomRight}% ${borderRadius.bottomLeft}% / 
                   ${Math.floor(randomInRange(borderRadiusSeed + 4, 3, 8))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 5, 90, 98))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 6, 5, 12))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 7, 92, 98))}%`,
      borderWidth: `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`,
      borderStyle: 'solid'
    } as React.CSSProperties,
    innerStyle: {
      transform: `rotate(${-rotateAngle}deg) skewX(${-skewX}deg)` // 反向轉回來，保持內容正常
    }
  };
}
