export const poses = [
  { name: '登場', shout: '可愛登場！', japanese: '注目っ！', caption: '聚光燈，準備好了！', accent: '今天的主角，就是我', side: '登場', symbol: '✦' },
  { name: '招呼', shout: '看這邊♡', japanese: 'こっち！', caption: '看這邊，跟上我的節奏。', accent: '目光借我一下下', side: '集合', symbol: '✧' },
  { name: '左指', shout: '一起向左！', japanese: 'せーの！', caption: '向左，把心動交給節拍。', accent: '預備，跟上這一拍', side: '預備', symbol: '←' },
  { name: '右指', shout: '再向右！', japanese: 'もう一回！', caption: '再向右，一起閃閃發光。', accent: '這份默契，滿分', side: '再來', symbol: '→' },
  { name: '比心', shout: '心動收下♡', japanese: 'きゅん♡', caption: '這一拍，送你一顆心。', accent: '給你一份專屬可愛', side: '心動', symbol: '♡' },
  { name: '應援', shout: '可愛全開！', japanese: '全力っ！', caption: '雙手舉高，可愛全力開啟！', accent: '你的應援，我聽到了', side: '全開', symbol: '↑' },
  { name: '跳躍', shout: '煩惱飛走！', japanese: 'とべっ！', caption: '輕輕跳起，煩惱暫停。', accent: '輕輕一跳，快樂加倍', side: '無敵', symbol: '✦' },
  { name: '謝幕', shout: '閃耀成功！', japanese: '大成功！', caption: '今天的閃耀，也有你一份。', accent: '謝謝你，陪我閃閃發光', side: '滿分', symbol: '☆' },
]
export const FRAME_COUNT = poses.length
export function frameAtTime(time) {
  return Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(Number(time) || 0)))
}
