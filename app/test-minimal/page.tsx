'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dgwfsazdcuukkbudlvvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd2ZzYXpkY3V1a2tidWRsdnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTg3NDcsImV4cCI6MjA3NTc3NDc0N30.5Pw4UL_uBa4ZI_ZPBum3Mtb8ccxqBjsBi-BLlsyO7Ic'
)

export default function TestMinimal() {
  const test = async () => {
    const email = `test${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({ email, password: '123456' })
    alert(error ? `Error: ${error.message}` : `Success! User: ${data.user?.id}`)
  }

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <button onClick={test} style={{ padding: '20px 40px', fontSize: '18px', cursor: 'pointer' }}>
        TEST SIGNUP
      </button>
    </div>
  )
}
