export default function Home() {
  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>理科問題集計システム</h1>
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <a 
          href="/vote" 
          style={{ 
            padding: '20px 40px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          投票画面へ
        </a>
        <a 
          href="/result" 
          style={{ 
            padding: '20px 40px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          集計画面へ
        </a>
      </div>
    </main>
  )
}
