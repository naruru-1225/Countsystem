import { kv } from '@vercel/kv'

// KVストアのキー名
const VOTES_KEY = 'votes'
const RESET_TIME_KEY = 'lastResetTime'

// 初期化関数: データベースに値がない場合に初期値を設定
async function initializeVotes() {
  const votes = await kv.get<Record<number, number>>(VOTES_KEY)
  if (!votes) {
    const initialVotes = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
    }
    await kv.set(VOTES_KEY, initialVotes)
    await kv.set(RESET_TIME_KEY, Date.now())
  }
}

export async function GET() {
  await initializeVotes()
  const votes = await kv.get<Record<number, number>>(VOTES_KEY)
  const lastResetTime = await kv.get<number>(RESET_TIME_KEY)
  return Response.json({ votes, lastResetTime })
}

export async function POST(request: Request) {
  await initializeVotes()
  const { choices, action } = await request.json()
  
  // choices が配列かチェック
  if (!Array.isArray(choices)) {
    return Response.json({ success: false, error: 'Invalid data format' }, { status: 400 })
  }
  
  // 現在の投票データを取得
  const votes = await kv.get<Record<number, number>>(VOTES_KEY) || {}
  
  // action が 'add' または 'remove' かチェック (デフォルトは 'add')
  const isAdding = action !== 'remove'
  
  // 各選択肢をカウント
  let hasValidChoice = false
  for (const choice of choices) {
    if (choice >= 1 && choice <= 8) {
      if (isAdding) {
        votes[choice] = (votes[choice] || 0) + 1
      } else {
        // 削除の場合は0未満にならないようにする
        votes[choice] = Math.max(0, (votes[choice] || 0) - 1)
      }
      hasValidChoice = true
    }
  }
  
  if (hasValidChoice) {
    // 更新された投票データを保存
    await kv.set(VOTES_KEY, votes)
    return Response.json({ success: true, votes })
  }
  
  return Response.json({ success: false, error: 'No valid choices' }, { status: 400 })
}

export async function DELETE() {
  // リセット機能
  const votes = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  }
  const lastResetTime = Date.now()
  
  await kv.set(VOTES_KEY, votes)
  await kv.set(RESET_TIME_KEY, lastResetTime)
  
  return Response.json({ success: true, votes, lastResetTime })
}

