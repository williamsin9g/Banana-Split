'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// 內嵌樣式定義
const styles = `
  /* Glass morphism effect */
  .kg-glass {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(17, 25, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }
  
  /* Animation keyframes */
  @keyframes kg-fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes kg-slide-in {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes kg-slide-right {
    from { transform: translateX(300px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  /* Component specific styles */
  .kg-modal {
    animation: kg-fade-in 0.3s ease-out;
  }
  
  .kg-content {
    animation: kg-slide-in 0.3s ease-out;
  }
  
  .kg-panel {
    animation: kg-slide-right 0.3s ease-out;
  }
  
  .kg-button-hover:hover {
    background-color: rgba(31, 41, 55, 0.8);
    transition: all 0.2s;
  }
  
  .kg-link-label {
    font-size: 8px;
    fill: #a0a0a0;
    text-anchor: middle;
  }
`;

// 節點介面定義
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  category: string
  mentions: number
  sentiment: 'positive' | 'negative' | 'neutral'
  trending: boolean
}

// 連結介面定義
export interface GraphLink {
  source: string
  target: string
  value: number
  relation: string
}

// 圖表數據介面
export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// 洞察介面定義
export interface NodeInsight {
  summary: string
  sentiment: string
  keyPoints: string[]
}

// 創意模板介面
export interface CreativeTemplate {
  concept: string
  description: string
  style: string
}

// 組件 Props 介面
export interface KnowledgeGraphProps {
  isVisible: boolean
  onClose: () => void
  onNodeClick: (nodeData: GraphNode, insight?: NodeInsight) => void
  
  // 可配置屬性（全部可選，有KFC默認值）
  title?: string
  subtitle?: string
  data?: GraphData
  insights?: Record<string, NodeInsight>
  creativeTemplates?: Record<string, CreativeTemplate>
  colorMap?: Record<string, string>
  width?: number
  height?: number
  
  // 統計數據配置
  stats?: {
    label: string
    value: string | number
    color?: string
  }[]
  
  // 圖例配置
  legend?: {
    category: string
    label: string
    color: string
  }[]
  
  // 語言配置
  language?: {
    title: string
    subtitle: string
    nodesTotalLabel: string
    linksTotalLabel: string
    mentionsLabel: string
    sentimentLabel: string
    insightsLabel: string
    keyPointsLabel: string
    templatesLabel: string
    conceptLabel: string
    descriptionLabel: string
    styleLabel: string
    generateButtonLabel: string
    instructionText: string
    legendTitle: string
    positiveLabel: string
    negativeLabel: string
    neutralLabel: string
  }
}

// KFC 專用創意模板
export const kfcCreativeTemplates: Record<string, CreativeTemplate> = {
  "韓式起司脆雞飯": {
    concept: "韓式風味饗宴",
    description: "展示韓式起司脆雞飯的誘人起司拉絲效果，搭配韓式辣醬的火紅色澤，營造正宗韓式料理氛圍",
    style: "韓式美食攝影風格，暖色調燈光，突出起司拉絲瞬間"
  },
  "爆漿卡士達蛋撻": {
    concept: "爆漿驚喜時刻", 
    description: "捕捉蛋撻被咬開瞬間，卡士達內餡流淌而出的驚艷畫面，傳達爆漿帶來的味覺驚喜",
    style: "特寫微距攝影，金黃色澤，突出流動質感"
  },
  "經典炸雞": {
    concept: "11種香料傳奇",
    description: "展現炸雞外酥內嫩的完美質感，搭配神秘香料氛圍，強調肯德基獨家配方的傳奇地位",
    style: "經典美食攝影，溫暖燈光，突出酥脆質感"
  },
  "家庭聚餐": {
    concept: "溫馨分享時光",
    description: "展現家人圍桌分享炸雞的溫馨畫面，突出肯德基在家庭重要時刻的陪伴價值",
    style: "溫馨家庭攝影風格，自然燈光，強調情感連結"
  },
  "韓流追星族": {
    concept: "K-Culture美食體驗",
    description: "結合韓流文化元素，展現年輕人享用韓式起司脆雞飯的時尚生活方式",
    style: "時尚生活攝影，活力色彩，突出年輕潮流感"
  },
  "下午茶時光": {
    concept: "悠閒午後享受",
    description: "展現蛋撻配茶的精緻下午茶時光，營造放鬆愉悅的休閒氛圍",
    style: "精緻生活攝影風格，柔和燈光，突出悠閒感"
  }
}

// KFC 節點顏色映射
export const kfcColorMap = {
  "brand": "#e74c3c",           // 品牌核心 - 紅色
  "hot_product": "#ff6b9d",     // 熱點新品 - 粉紅色 
  "core_product": "#f39c12",    // 經典產品 - 橙色
  "marketing_event": "#8e44ad",  // 行銷事件 - 紫色
  "usage_scenario": "#16a085",   // 使用場景 - 青綠色
  "purchase_channel": "#795548", // 購買管道 - 棕色
  "service_issue": "#e67e22",    // 服務問題 - 橙紅色
  "consumer_group": "#3498db"    // 消費族群 - 藍色
}

// 通用預設顏色映射 
const defaultColorMap = {
  "primary": "#e74c3c",      // 主要 - 紅色
  "secondary": "#ff6b9d",    // 次要 - 粉紅色 
  "success": "#f39c12",      // 成功 - 橙色
  "info": "#8e44ad",         // 資訊 - 紫色
  "warning": "#16a085",      // 警告 - 青綠色
  "danger": "#795548",       // 危險 - 棕色
  "light": "#e67e22",        // 淺色 - 橙紅色
  "dark": "#3498db"          // 深色 - 藍色
}

// KFC 專用統計數據
export const kfcStats = [
  { label: "總節點數", value: 26, color: "#f87171" },
  { label: "總連結數", value: 35, color: "#f87171" },
  { label: "真實討論", value: 1237, color: "#f87171" },
  { label: "正面評價率", value: "87%", color: "#10b981" },
  { label: "2025熱點新品", value: 6, color: "#facc15" }
]

// KFC 專用圖例
export const kfcLegend = [
  { category: "brand", label: "品牌核心", color: "#e74c3c" },
  { category: "hot_product", label: "熱點新品", color: "#ff6b9d" },
  { category: "core_product", label: "經典產品", color: "#f39c12" },
  { category: "consumer_group", label: "消費族群", color: "#3498db" },
  { category: "usage_scenario", label: "使用場景", color: "#16a085" },
  { category: "marketing_event", label: "行銷事件", color: "#8e44ad" },
  { category: "purchase_channel", label: "購買管道", color: "#795548" },
  { category: "service_issue", label: "服務問題", color: "#e67e22" }
]

// KFC 專用語言配置
export const kfcLanguage = {
  title: "肯德基輿情知識圖譜",
  subtitle: "基於1237則真實討論的AI深度分析 • 點擊節點生成對應廣告素材",
  nodesTotalLabel: "總節點數",
  linksTotalLabel: "總連結數",
  mentionsLabel: "次提及",
  sentimentLabel: "情感傾向",
  insightsLabel: "深度洞察",
  keyPointsLabel: "關鍵要點",
  templatesLabel: "創意模板預覽",
  conceptLabel: "概念",
  descriptionLabel: "描述",
  styleLabel: "風格",
  generateButtonLabel: "生成廣告素材",
  instructionText: "💡 點擊任意節點可基於輿情洞察自動生成對應的廣告創意素材",
  legendTitle: "圖例",
  positiveLabel: "😊 正面",
  negativeLabel: "😔 負面",
  neutralLabel: "😐 中性"
}

// 預設語言配置
const defaultLanguage = {
  title: "知識圖譜",
  subtitle: "基於數據分析的深度洞察 • 點擊節點查看詳細資訊",
  nodesTotalLabel: "總節點數",
  linksTotalLabel: "總連結數", 
  mentionsLabel: "次提及",
  sentimentLabel: "情感傾向",
  insightsLabel: "深度洞察",
  keyPointsLabel: "關鍵要點",
  templatesLabel: "創意模板預覽",
  conceptLabel: "概念",
  descriptionLabel: "描述",
  styleLabel: "風格",
  generateButtonLabel: "生成內容",
  instructionText: "💡 點擊任意節點可查看詳細洞察分析",
  legendTitle: "圖例",
  positiveLabel: "😊 正面",
  negativeLabel: "😔 負面",
  neutralLabel: "😐 中性"
}

// KFC 2025年輿情知識圖譜數據
export const kfcGraphData: GraphData = {
  nodes: [
    // 品牌節點
    {id: "肯德基", name: "肯德基", category: "brand", mentions: 1237, sentiment: "positive", trending: true},
    
    // 2025年熱點新品
    {id: "韓式起司脆雞飯", name: "韓式起司脆雞飯", category: "hot_product", mentions: 87, sentiment: "positive", trending: true},
    {id: "爆漿卡士達蛋撻", name: "爆漿卡士達蛋撻", category: "hot_product", mentions: 64, sentiment: "positive", trending: true},
    {id: "明太子無骨脆雞", name: "明太子無骨脆雞", category: "hot_product", mentions: 45, sentiment: "positive", trending: true},
    {id: "青花椒香麻系列", name: "青花椒香麻系列", category: "hot_product", mentions: 38, sentiment: "positive", trending: true},
    
    // 經典產品
    {id: "經典炸雞", name: "經典炸雞", category: "core_product", mentions: 176, sentiment: "positive", trending: true},
    {id: "原味蛋撻", name: "原味蛋撻", category: "core_product", mentions: 89, sentiment: "positive", trending: true},
    {id: "上校雞塊", name: "上校雞塊", category: "core_product", mentions: 52, sentiment: "positive", trending: true},
    
    // 行銷事件
    {id: "黑白大廚聯名", name: "黑白大廚聯名", category: "marketing_event", mentions: 67, sentiment: "positive", trending: true},
    {id: "618促銷活動", name: "618促銷活動", category: "marketing_event", mentions: 43, sentiment: "positive", trending: true},
    
    // 真實使用場景
    {id: "家庭聚餐", name: "家庭聚餐", category: "usage_scenario", mentions: 36, sentiment: "positive", trending: true},
    {id: "下午茶時光", name: "下午茶時光", category: "usage_scenario", mentions: 38, sentiment: "positive", trending: true},
    {id: "生日慶祝", name: "生日慶祝", category: "usage_scenario", mentions: 28, sentiment: "positive", trending: true},
    {id: "深夜宵夜", name: "深夜宵夜", category: "usage_scenario", mentions: 22, sentiment: "positive", trending: true},
    {id: "追劇配餐", name: "追劇配餐", category: "usage_scenario", mentions: 15, sentiment: "positive", trending: true},
    
    // 消費族群
    {id: "韓流追星族", name: "韓流追星族", category: "consumer_group", mentions: 67, sentiment: "positive", trending: true},
    {id: "炸雞愛好者", name: "炸雞愛好者", category: "consumer_group", mentions: 156, sentiment: "positive", trending: true},
    {id: "蛋撻控", name: "蛋撻控", category: "consumer_group", mentions: 89, sentiment: "positive", trending: true},
    {id: "優惠券獵人", name: "優惠券獵人", category: "consumer_group", mentions: 124, sentiment: "positive", trending: true},
    {id: "外送重度用戶", name: "外送重度用戶", category: "consumer_group", mentions: 45, sentiment: "positive", trending: true},
    
    // 購買管道
    {id: "Foodpanda外送", name: "Foodpanda外送", category: "purchase_channel", mentions: 23, sentiment: "positive", trending: true},
    {id: "KFC官方APP", name: "KFC官方APP", category: "purchase_channel", mentions: 18, sentiment: "positive", trending: true},
    {id: "門市現場", name: "門市現場", category: "purchase_channel", mentions: 20, sentiment: "neutral", trending: true},
    
    // 服務問題
    {id: "出餐等待時間", name: "出餐等待時間", category: "service_issue", mentions: 61, sentiment: "negative", trending: true},
    {id: "點餐準確度", name: "點餐準確度", category: "service_issue", mentions: 119, sentiment: "negative", trending: true},
    {id: "食物保溫效果", name: "食物保溫效果", category: "service_issue", mentions: 34, sentiment: "neutral", trending: true}
  ],
  links: [
    // 品牌與熱點新品關聯
    {source: "肯德基", target: "韓式起司脆雞飯", value: 5, relation: "2025爆紅新品"},
    {source: "肯德基", target: "爆漿卡士達蛋撻", value: 5, relation: "6月回歸限定"},
    {source: "肯德基", target: "明太子無骨脆雞", value: 4, relation: "夏季限定新品"},
    {source: "肯德基", target: "青花椒香麻系列", value: 4, relation: "四川風味系列"},
    
    // 品牌與經典產品關聯
    {source: "肯德基", target: "經典炸雞", value: 5, relation: "招牌產品"},
    {source: "肯德基", target: "原味蛋撻", value: 5, relation: "經典甜點"},
    {source: "肯德基", target: "上校雞塊", value: 4, relation: "經典產品"},
    
    // 品牌與行銷事件關聯
    {source: "肯德基", target: "黑白大廚聯名", value: 5, relation: "話題行銷"},
    {source: "肯德基", target: "618促銷活動", value: 4, relation: "促銷策略"},
    
    // 熱點產品與事件關聯
    {source: "韓式起司脆雞飯", target: "黑白大廚聯名", value: 5, relation: "聯名主打"},
    {source: "韓式起司脆雞飯", target: "韓流追星族", value: 5, relation: "目標客群"},
    {source: "爆漿卡士達蛋撻", target: "蛋撻控", value: 5, relation: "期待回歸"},
    {source: "明太子無骨脆雞", target: "下午茶時光", value: 4, relation: "夏季新選擇"},
    
    // 產品與場景關聯
    {source: "經典炸雞", target: "家庭聚餐", value: 5, relation: "分享首選"},
    {source: "原味蛋撻", target: "下午茶時光", value: 5, relation: "經典搭配"},
    {source: "上校雞塊", target: "生日慶祝", value: 4, relation: "慶祝套餐"},
    
    // 消費族群與產品關聯
    {source: "炸雞愛好者", target: "經典炸雞", value: 5, relation: "忠實偏愛"},
    {source: "蛋撻控", target: "原味蛋撻", value: 5, relation: "經典首選"},
    {source: "韓流追星族", target: "韓式起司脆雞飯", value: 5, relation: "話題追蹤"},
    {source: "優惠券獵人", target: "618促銷活動", value: 5, relation: "優惠追蹤"},
    
    // 購買管道與客群關聯
    {source: "Foodpanda外送", target: "外送重度用戶", value: 5, relation: "主要管道"},
    {source: "KFC官方APP", target: "優惠券獵人", value: 4, relation: "優惠獲取"},
    {source: "門市現場", target: "炸雞愛好者", value: 4, relation: "體驗偏好"},
    
    // 服務問題與客群關聯
    {source: "出餐等待時間", target: "外送重度用戶", value: 4, relation: "主要痛點"},
    {source: "點餐準確度", target: "炸雞愛好者", value: 4, relation: "體驗影響"},
    {source: "食物保溫效果", target: "外送重度用戶", value: 3, relation: "品質關注"}
  ]
}

// KFC深度洞察數據
export const kfcInsights: Record<string, NodeInsight> = {
  "肯德基": {
    summary: "肯德基在台灣快餐市場以炸雞專業技術建立領導地位，1237次真實討論中體現出強勢的品牌認知度。2025年與Netflix《黑白大廚》崔鉉碩聯名推出韓式起司脆雞飯引爆話題，結合經典蛋撻優勢，持續鞏固市場地位。",
    sentiment: "正面",
    keyPoints: ["炸雞領導地位", "黑白大廚聯名話題", "蛋撻差異化優勢", "韓式創新嘗試"]
  },
  "韓式起司脆雞飯": {
    summary: "2025年最具話題性的新品，與Netflix熱門節目《黑白大廚》崔鉉碩聯名推出。87次討論中消費者對韓式辣醬和起司融合的創新口感給予高度評價，'終於等到你'的熱烈反應體現出成功的跨界合作。",
    sentiment: "正面",
    keyPoints: ["Netflix聯名話題", "崔鉉碩主廚加持", "韓式創新口感", "社群媒體熱議"]
  },
  "爆漿卡士達蛋撻": {
    summary: "6月強勢回歸的限定蛋撻，64次討論中展現出消費者的高度期待和喜愛。'要衝啊'等熱烈反應反映出稀缺性行銷的成功，爆漿設計升級了經典蛋撻體驗。",
    sentiment: "正面",
    keyPoints: ["限定回歸話題", "爆漿創新設計", "消費者高度期待", "稀缺性行銷成功"]
  },
  "經典炸雞": {
    summary: "肯德基的絕對招牌產品，176次討論中體現出無可撼動的品牌象徵地位。獨特的11種香料調味配方和外酥內嫩口感，創造了競爭對手難以複製的味覺記憶。",
    sentiment: "正面",
    keyPoints: ["品牌象徵地位", "11種香料秘方", "外酥內嫩口感", "無法複製優勢"]
  },
  "原味蛋撻": {
    summary: "肯德基最具代表性的甜點，89次討論中消費者一致認為'吃來吃去就原味蛋撻最好吃'。酥脆塔皮配香滑卡士達的經典組合，創造了快餐界獨一無二的甜點體驗。",
    sentiment: "正面",
    keyPoints: ["最具代表性甜點", "消費者一致認可", "經典組合完美", "獨一無二體驗"]
  },
  "黑白大廚聯名": {
    summary: "2025年最成功的話題行銷事件，與Netflix熱門節目《黑白大廚》崔鉉碩聯名合作。67次討論中體現出'終於等到你'的消費者期待，成功結合流行文化與美食創新。",
    sentiment: "正面",
    keyPoints: ["Netflix熱門聯名", "崔鉉碩主廚加持", "流行文化結合", "年輕客群吸引"]
  },
  "韓流追星族": {
    summary: "受《黑白大廚》聯名影響而關注肯德基的新興客群，67次討論中展現出對韓式料理和K-culture的高度興趣。韓式起司脆雞飯成為這個族群的話題焦點。",
    sentiment: "正面",
    keyPoints: ["Netflix節目影響", "K-culture興趣", "話題焦點產品", "流行文化驅動"]
  },
  "蛋撻控": {
    summary: "專門為蛋撻而來的忠實客群，89次討論中體現出對蛋撻產品的深度依戀。從原味到爆漿卡士達的每次創新都能引起這個族群的高度關注。",
    sentiment: "正面",
    keyPoints: ["蛋撻深度依戀", "創新高度關注", "忠實客群支撐", "甜點策略核心"]
  },
  "優惠券獵人": {
    summary: "積極追蹤和分享優惠資訊的價格敏感族群，124次討論中體現出對618促銷、信用卡優惠等價格策略的高度關注。具有很強的口碑傳播力。",
    sentiment: "正面",
    keyPoints: ["價格敏感特徵", "優惠資訊分享", "促銷活動關注", "口碑傳播力"]
  },
  "炸雞愛好者": {
    summary: "對肯德基11種香料炸雞情有獨鍾的核心客群，156次討論中體現出對品牌的深度忠誠。是品牌最重要的支撐力量。",
    sentiment: "正面", 
    keyPoints: ["核心忠實客群", "11種香料偏愛", "品牌深度忠誠", "支撐力量"]
  },
  "家庭聚餐": {
    summary: "家庭聚餐是肯德基的核心使用場景，36次討論中體現出炸雞分享特性的社交價值。'慶祝開幕'等聚餐活動反映出肯德基在重要時刻的參與度。",
    sentiment: "正面",
    keyPoints: ["核心使用場景", "分享社交價值", "重要時刻參與", "家庭友善品牌"]
  },
  "下午茶時光": {
    summary: "下午茶場景在38次討論中展現出蛋撻配飲料的經典組合魅力。'坐下來聊天，吃個小點心'體現了肯德基在休閒社交場景中的重要地位。",
    sentiment: "正面",
    keyPoints: ["蛋撻經典組合", "休閒社交場景", "聊天配餐首選", "輕鬆氛圍營造"]
  }
}

export default function KnowledgeGraph(props: KnowledgeGraphProps) {
  const {
    isVisible,
    onClose,
    onNodeClick,
    title = kfcLanguage.title,
    subtitle = kfcLanguage.subtitle, 
    data = kfcGraphData,
    insights = kfcInsights,
    creativeTemplates = kfcCreativeTemplates,
    colorMap = kfcColorMap,
    width = 800,
    height = 600,
    stats = kfcStats,
    legend = kfcLegend,
    language = kfcLanguage
  } = props

  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showInsight, setShowInsight] = useState(false)
  const [generateFeedback, setGenerateFeedback] = useState('')

  // 注入樣式
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // D3.js 圖形渲染
  useEffect(() => {
    if (!isVisible || !svgRef.current || !data.nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g")
    
    // 創建力導向模擬
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(80).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(25))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))

    // 創建連結線
    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#64748b")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => d.value)

    // 創建連結標籤
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(data.links)
      .enter()
      .append("text")
      .attr("class", "kg-link-label")
      .attr("dy", -2)
      .text((d: any) => d.relation)

    // 創建節點
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")

    node.append("circle")
      .attr("r", (d: any) => {
        const sizeScale = d3.scaleLinear()
          .domain([0, d3.max(data.nodes, (n: any) => n.mentions) || 1])
          .range([8, 25])
        return sizeScale(d.mentions)
      })
      .attr("fill", (d: any) => {
        const color = (colorMap as any)[d.category] || (defaultColorMap as any)[d.category] || "#666"
        if (insights[d.id]) {
          return d3.color(color)?.brighter(0.3)?.toString() || color
        }
        return color
      })
      .attr("stroke", (d: any) => {
        if (insights[d.id]) return "#e74c3c"
        if (d.trending) return "#ffd700"
        return "#333"
      })
      .attr("stroke-width", (d: any) => insights[d.id] ? 3 : (d.trending ? 2 : 1.5))

    node.append("text")
      .attr("dx", 30)
      .attr("dy", ".35em")
      .text((d: any) => d.name + (insights[d.id] ? " 🧠" : "") + (d.trending ? " 🔥" : ""))
      .attr("font-size", 10)
      .attr("fill", "#e0e0e0")

    // 添加點擊事件
    node.on("click", (event: any, d: any) => {
      setSelectedNode(d)
      setShowInsight(true)
      onNodeClick(d, insights[d.id])
    })

    // 添加拖拽行為
    const drag = d3.drag()
      .on("start", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event: any, d: any) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    node.call(drag as any)

    // 更新位置
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // 添加縮放行為
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: any) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom as any)

  }, [isVisible, data, insights, colorMap, width, height])

  if (!isVisible) return null

  // 計算統計數據
  const defaultStats = data === kfcGraphData ? kfcStats : [
    { label: language.nodesTotalLabel, value: data.nodes.length, color: "#f87171" },
    { label: language.linksTotalLabel, value: data.links.length, color: "#f87171" },
  ]

  const displayStats = stats || defaultStats

  // 計算圖例
  const defaultLegend = data === kfcGraphData ? kfcLegend : Object.keys(colorMap).map(category => ({
    category,
    label: category,
    color: (colorMap as any)[category]
  }))

  const displayLegend = legend || defaultLegend

  return (
    <div
      className="kg-modal fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="kg-content rounded-2xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#111827',
          width: '95vw',
          height: '90vh',
          maxWidth: '1152px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid #374151' }}
        >
          <div>
            <h2 
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: 'white' }}
            >
              🧠 {title}
              <span style={{ color: '#fbbf24' }}>✨</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '4px' }}>
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="kg-button-hover p-2 rounded-lg"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              transition: 'all 0.2s'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div 
          className="flex justify-around p-4"
          style={{ 
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151'
          }}
        >
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className={`text-2xl font-bold ${stat.color || 'text-red-400'}`}
                style={{ 
                  color: stat.color?.includes('text-') ? undefined : (stat.color || '#f87171')
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Graph Container */}
        <div className="flex" style={{ height: 'calc(100% - 140px)' }}>
          {/* Main Graph */}
          <div className="flex-1 relative">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ 
                backgroundColor: '#111827',
                minHeight: '500px'
              }}
            />
            
            {/* Legend */}
            <div 
              className="kg-glass absolute top-4 left-4 p-4 rounded-lg"
              style={{ maxWidth: '200px' }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{ color: 'white' }}
              >
                {language.legendTitle}
              </h4>
              <div className="space-y-1" style={{ fontSize: '0.75rem' }}>
                {displayLegend.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span style={{ color: '#d1d5db' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div 
              className="kg-glass absolute bottom-4 left-4 p-3 rounded-lg"
              style={{ maxWidth: '300px' }}
            >
              <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                {language.instructionText}
              </p>
            </div>
          </div>

          {/* Insight Panel */}
          {showInsight && selectedNode && (
            <div 
              className="kg-panel w-80 p-4 overflow-y-auto"
              style={{ 
                backgroundColor: '#1f2937',
                borderLeft: '1px solid #374151'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-semibold"
                  style={{ color: 'white' }}
                >
                  {selectedNode.name}
                </h3>
                <button
                  onClick={() => setShowInsight(false)}
                  style={{ 
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Node Stats */}
              <div 
                className="rounded-lg p-3 mb-4"
                style={{ backgroundColor: '#374151' }}
              >
                <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>討論熱度</div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: '#f87171' }}
                >
                  {selectedNode.mentions} {language.mentionsLabel}
                </div>
                <div 
                  style={{ fontSize: '0.875rem', color: '#d1d5db', marginTop: '8px' }}
                >
                  {language.sentimentLabel}
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ 
                    color: selectedNode.sentiment === 'positive' ? '#10b981' :
                           selectedNode.sentiment === 'negative' ? '#f87171' : '#facc15'
                  }}
                >
                  {selectedNode.sentiment === 'positive' ? language.positiveLabel :
                   selectedNode.sentiment === 'negative' ? language.negativeLabel : language.neutralLabel}
                </div>
              </div>

              {/* Insight */}
              {insights[selectedNode.id] && (
                <div 
                  className="rounded-lg p-3 mb-4"
                  style={{ backgroundColor: '#374151' }}
                >
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: '#f87171' }}
                  >
                    🧠 {language.insightsLabel}
                  </h4>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: '#d1d5db' }}
                  >
                    {insights[selectedNode.id].summary}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    <strong>{language.keyPointsLabel}：</strong> {insights[selectedNode.id].keyPoints.join(' • ')}
                  </div>
                </div>
              )}

              {/* Creative Template Preview */}
              {creativeTemplates[selectedNode.id] && (
                <div 
                  className="rounded-lg p-3 mb-4"
                  style={{ backgroundColor: '#374151' }}
                >
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: '#facc15' }}
                  >
                    🎨 {language.templatesLabel}
                  </h4>
                  <div className="space-y-2" style={{ fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.conceptLabel}：</span>
                      <span style={{ color: 'white' }}>{creativeTemplates[selectedNode.id].concept}</span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.descriptionLabel}：</span>
                      <span style={{ color: '#d1d5db' }}>{creativeTemplates[selectedNode.id].description}</span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.styleLabel}：</span>
                      <span style={{ color: '#d1d5db' }}>{creativeTemplates[selectedNode.id].style}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={() => {
                  console.log('🎨 生成廣告素材按鈕被點擊:', selectedNode?.name);
                  
                  // 顯示短暫反饋，不阻塞按鈕
                  setGenerateFeedback(`正在創建 ${selectedNode?.name} 節點...`);
                  
                  // 直接創建 concept 節點
                  const conceptData = {
                    title: selectedNode?.name || '',
                    content: selectedNode?.name || '',
                    insight: insights[selectedNode?.id]
                  };
                  
                  console.log('🎯 直接發送創建 concept 事件:', conceptData);
                  window.dispatchEvent(new CustomEvent('createConceptFromKnowledgeGraph', {
                    detail: conceptData
                  }));
                  
                  // 短暫的成功反饋，不阻塞按鈕
                  setTimeout(() => {
                    setGenerateFeedback(`✅ ${selectedNode?.name} 已加入編輯器！`);
                    setTimeout(() => {
                      setGenerateFeedback('');
                    }, 1500);
                  }, 300);
                }}
                className="w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626'
                }}
              >
                <span>✨</span>
                {language.generateButtonLabel}
              </button>
              
              {/* Feedback Message */}
              {generateFeedback && (
                <div 
                  className="mt-3 text-center text-sm font-medium p-2 rounded-lg"
                  style={{
                    backgroundColor: generateFeedback.includes('✅') ? '#10b981' : '#3b82f6',
                    color: 'white'
                  }}
                >
                  {generateFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// KFC專用便利組件 - 直接使用，無需配置
export function KFCKnowledgeGraph({ 
  isVisible, 
  onClose, 
  onNodeClick 
}: {
  isVisible: boolean
  onClose: () => void
  onNodeClick: (nodeData: GraphNode, insight?: NodeInsight) => void
}) {
  return (
    <KnowledgeGraph
      isVisible={isVisible}
      onClose={onClose}
      onNodeClick={onNodeClick}
      data={kfcGraphData}
      insights={kfcInsights}
      creativeTemplates={kfcCreativeTemplates}
      colorMap={kfcColorMap}
      stats={kfcStats}
      legend={kfcLegend}
      language={kfcLanguage}
      title="🍗 肯德基輿情知識圖譜"
      subtitle="基於1237則真實討論的AI深度分析 • 點擊節點生成對應廣告素材"
    />
  )
}

// 使用示例：

/* 
// 方法1：使用便利的KFC組件（推薦）
import { KFCKnowledgeGraph } from './KnowledgeGraph'

function App() {
  const [showKFCGraph, setShowKFCGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowKFCGraph(true)}>
        打開KFC知識圖譜
      </button>
      
      <KFCKnowledgeGraph
        isVisible={showKFCGraph}
        onClose={() => setShowKFCGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('🍗 KFC節點點擊:', node.name)
          console.log('💡 洞察:', insight)
          // 在這裡可以觸發廣告素材生成等功能
        }}
      />
    </div>
  )
}
*/

/* 
// 方法2：使用完整配置的通用組件
import KnowledgeGraph, { kfcGraphData, kfcInsights, kfcCreativeTemplates } from './KnowledgeGraph'

function App() {
  const [showGraph, setShowGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowGraph(true)}>
        打開自定義知識圖譜
      </button>
      
      <KnowledgeGraph
        isVisible={showGraph}
        onClose={() => setShowGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('節點點擊:', node.name, insight)
        }}
        data={kfcGraphData}
        insights={kfcInsights}
        creativeTemplates={kfcCreativeTemplates}
        title="我的KFC分析"
        subtitle="自定義的輿情分析"
      />
    </div>
  )
}
*/

/*
// 方法3：使用自己的數據
import KnowledgeGraph from './KnowledgeGraph'

const myData = {
  nodes: [
    {id: "node1", name: "節點1", category: "primary", mentions: 100, sentiment: "positive", trending: true},
    // ... 更多節點
  ],
  links: [
    {source: "node1", target: "node2", value: 5, relation: "強關聯"},
    // ... 更多連結
  ]
}

const myInsights = {
  "node1": {
    summary: "這是我的節點分析...",
    sentiment: "正面",
    keyPoints: ["特點1", "特點2", "特點3"]
  }
}

function App() {
  const [showGraph, setShowGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowGraph(true)}>
        打開我的知識圖譜
      </button>
      
      <KnowledgeGraph
        isVisible={showGraph}
        onClose={() => setShowGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('點擊了:', node.name)
        }}
        data={myData}
        insights={myInsights}
        title="我的知識圖譜"
      />
    </div>
  )
}
*/

/*
安裝依賴：
npm install d3 @types/d3 react

特色功能：
✅ 完全獨立 - 無外部CSS依賴，內嵌所有樣式
✅ 開箱即用 - 包含完整KFC輿情數據和洞察
✅ 高度可配置 - 支援自定義數據、顏色、語言等
✅ 互動式圖表 - D3.js力導向布局，支援拖拽縮放
✅ 深度洞察面板 - 點擊節點顯示詳細分析
✅ 創意模板系統 - 內建廣告創意生成模板
✅ 響應式設計 - 適應各種螢幕尺寸
✅ TypeScript支援 - 完整的型別定義

直接複製這個檔案到你的專案就可以使用！
*/

