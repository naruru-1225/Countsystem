'use client'

import { useState, useEffect } from 'react'
import styles from './result.module.css'

interface VoteData {
  [key: number]: number
}

export default function ResultPage() {
  const [votes, setVotes] = useState<VoteData>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0
  })
  const [selectedChoices, setSelectedChoices] = useState<number[]>([])

  const fetchVotes = async () => {
    try {
      const response = await fetch('/api/votes')
      const data = await response.json()
      // data.votes を使用（APIレスポンスが { votes, lastResetTime } の形式になったため）
      setVotes(data.votes || data)
    } catch (error) {
      console.error('データ取得エラー:', error)
    }
  }

  useEffect(() => {
    fetchVotes()
    // 3秒ごとにデータを更新
    const interval = setInterval(fetchVotes, 3000)
    return () => clearInterval(interval)
  }, [])

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0)
  
  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0
    return Math.round((count / totalVotes) * 100)
  }

  // 投票割合に応じた色のグラデーションを取得
  const getGradientClass = (percentage: number) => {
    if (percentage === 0) return ''
    if (percentage <= 10) return styles.gradient10
    if (percentage <= 20) return styles.gradient20
    if (percentage <= 30) return styles.gradient30
    if (percentage <= 40) return styles.gradient40
    if (percentage <= 50) return styles.gradient50
    if (percentage <= 60) return styles.gradient60
    if (percentage <= 70) return styles.gradient70
    if (percentage <= 80) return styles.gradient80
    if (percentage <= 90) return styles.gradient90
    return styles.gradient100
  }

  const maxVotes = Math.max(...Object.values(votes))
  const getMostVoted = () => {
    if (totalVotes === 0) return []
    return Object.entries(votes)
      .filter(([, count]) => count === maxVotes && count > 0)
      .map(([choice]) => Number(choice))
  }

  const mostVotedChoices = getMostVoted()

  const handleReset = async () => {
    if (confirm('全ての投票データをリセットしますか?')) {
      try {
        await fetch('/api/votes', { method: 'DELETE' })
        fetchVotes()
      } catch (error) {
        console.error('リセットエラー:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>集計画面</h1>
      <div className={styles.stats}>
        <p className={styles.totalVotes}>総投票数: {totalVotes}票</p>
      </div>

      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
          const isMostVoted = mostVotedChoices.includes(num)
          const percentage = getPercentage(votes[num])
          const gradientClass = getGradientClass(percentage)
          const isSelected = selectedChoices.includes(num)
          
          return (
            <div key={num} className={styles.boxWrapper}>
              <button
                className={`${styles.box} ${
                  isSelected ? styles.selected : ''
                } ${isMostVoted ? styles.mostVoted : ''} ${gradientClass}`}
                onClick={() => {
                  setSelectedChoices(prev => 
                    prev.includes(num) 
                      ? prev.filter(c => c !== num)
                      : [...prev, num]
                  )
                }}
              >
                {num}
              </button>
              <div className={styles.voteInfo}>
                <p className={styles.voteCount}>{votes[num]}票</p>
                <p className={styles.percentage}>{percentage}%</p>
                {isMostVoted && totalVotes > 0 && (
                  <p className={styles.badge}>最多</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={handleReset}>
          投票データをリセット
        </button>
      </div>
    </div>
  )
}
