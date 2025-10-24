'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './vote.module.css'

export default function VotePage() {
  const [selectedChoices, setSelectedChoices] = useState<number[]>([])
  const lastResetTimeRef = useRef<number>(Date.now())

  // リセット検知：定期的にサーバーのリセット状態をチェック
  useEffect(() => {
    const checkReset = async () => {
      try {
        const response = await fetch('/api/votes')
        const data = await response.json()
        
        // サーバーのリセットタイムスタンプが更新されていたら選択をクリア
        if (data.lastResetTime > lastResetTimeRef.current) {
          setSelectedChoices([])
          lastResetTimeRef.current = data.lastResetTime
        }
      } catch (error) {
        console.error('リセット検知エラー:', error)
      }
    }

    // 初回チェック
    checkReset()
    
    // 3秒ごとにチェック
    const interval = setInterval(checkReset, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // ブラウザを離れる際に投票を無効化
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedChoices.length > 0) {
        // navigator.sendBeacon を使用して確実にリクエストを送信
        const blob = new Blob(
          [JSON.stringify({ choices: selectedChoices, action: 'remove' })],
          { type: 'application/json' }
        )
        navigator.sendBeacon('/api/votes', blob)
      }
    }

    // beforeunloadイベントのみを使用（ブラウザ/タブを閉じる時のみ発火）
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [selectedChoices])

  const handleToggleChoice = async (choice: number) => {
    const isCurrentlySelected = selectedChoices.includes(choice)
    
    try {
      // 選択状態に応じて投票または投票取り消し
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          choices: [choice],
          action: isCurrentlySelected ? 'remove' : 'add'
        }),
      })

      if (response.ok) {
        // APIリクエストが成功したら状態を更新
        setSelectedChoices(prev => {
          if (isCurrentlySelected) {
            // 既に選択されている場合は削除（選択解除）
            return prev.filter(c => c !== choice)
          } else {
            // 選択されていない場合は追加
            return [...prev, choice]
          }
        })
      }
    } catch (error) {
      console.error('投票エラー:', error)
    }
  }

  const handleReset = async () => {
    if (selectedChoices.length === 0) {
      return
    }

    if (!confirm('選択をリセットしますか？')) {
      return
    }

    try {
      // 現在選択されているすべての選択肢を取り消し
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          choices: selectedChoices,
          action: 'remove'
        }),
      })

      if (response.ok) {
        setSelectedChoices([])
      }
    } catch (error) {
      console.error('リセットエラー:', error)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>投票画面</h1>
      <p className={styles.subtitle}>
        選択肢を選んでください（複数選択可・即時反映）
      </p>
      {selectedChoices.length > 0 && (
        <p className={styles.selectedInfo}>
          現在 {selectedChoices.length}個選択中: {selectedChoices.sort((a, b) => a - b).join(', ')}
        </p>
      )}
      
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <button
            key={num}
            className={`${styles.box} ${
              selectedChoices.includes(num) ? styles.selected : ''
            }`}
            onClick={() => handleToggleChoice(num)}
          >
            {num}
          </button>
        ))}
      </div>

      {selectedChoices.length > 0 && (
        <button 
          className={styles.resetButton}
          onClick={handleReset}
        >
          選択をリセット
        </button>
      )}
    </div>
  )
}
