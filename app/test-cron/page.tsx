'use client'

export default function TestCronPage() {
  const runCron = async () => {
    const response = await fetch('/api/cron/check-ranks', {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || '309X1rNqGuo0MfIvTc0ogMi51f8mWxJiK/GW8bCwhOQ='}`
      }
    })
    
    const data = await response.json()
    console.log('Cron result:', data)
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Cron Job</h1>
      <button 
        onClick={runCron}
        className="px-6 py-3 bg-orange-600 text-white rounded-lg"
      >
        Run Rank Check
      </button>
    </div>
  )
}
