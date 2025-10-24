// 投票データを保存するメモリストア
let votes: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
}

// リセットタイムスタンプ（投票画面がリセットを検知するため）
let lastResetTime = Date.now()

export async function GET() {
  return Response.json({ votes, lastResetTime })
}

export async function POST(request: Request) {
  const { choices, action } = await request.json()
  
  // choices が配列かチェック
  if (!Array.isArray(choices)) {
    return Response.json({ success: false, error: 'Invalid data format' }, { status: 400 })
  }
  
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
    return Response.json({ success: true, votes })
  }
  
  return Response.json({ success: false, error: 'No valid choices' }, { status: 400 })
}

export async function DELETE() {
  // リセット機能
  votes = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  }
  // リセットタイムスタンプを更新
  lastResetTime = Date.now()
  return Response.json({ success: true, votes, lastResetTime })
}
