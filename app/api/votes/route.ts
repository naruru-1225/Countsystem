import Redis from 'ioredis'

// Redisクライアントの初期化
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// KVストアのキー名
const VOTES_KEY = 'votes'
const RESET_TIME_KEY = 'lastResetTime'

// 初期化関数: データベースに値がない場合に初期値を設定
async function initializeVotes() {
  const votes = await redis.get(VOTES_KEY)
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
    await redis.set(VOTES_KEY, JSON.stringify(initialVotes))
    await redis.set(RESET_TIME_KEY, Date.now().toString())
  }
}

export async function GET() {
  await initializeVotes()
  const votesStr = await redis.get(VOTES_KEY)
  const resetTimeStr = await redis.get(RESET_TIME_KEY)
  
  const votes = votesStr ? JSON.parse(votesStr) : {}
  const lastResetTime = resetTimeStr ? parseInt(resetTimeStr) : Date.now()
  
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
  const votesStr = await redis.get(VOTES_KEY)
  const votes: Record<number, number> = votesStr ? JSON.parse(votesStr) : {}
  
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
    await redis.set(VOTES_KEY, JSON.stringify(votes))
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
  
  await redis.set(VOTES_KEY, JSON.stringify(votes))
  await redis.set(RESET_TIME_KEY, lastResetTime.toString())
  
  return Response.json({ success: true, votes, lastResetTime })
}


