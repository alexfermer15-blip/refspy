import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// EXPORT users чтобы login route мог их использовать
export const users: any[] = []

export async function POST(request: Request) {
  console.log('🚀 API called')
  
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log('Data:', { name, email })

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Проверка дубликата
    const existing = users.find(u => u.email === email)
    if (existing) {
      console.log('Email exists')
      return NextResponse.json({ error: 'Email exists' }, { status: 409 })
    }

    console.log('Hashing...')
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('Hashed')

    // Сохраняем в память
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    }

    users.push(user)
    console.log('SUCCESS! User saved to memory:', user)
    console.log('Total users:', users.length)

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email }
    }, { status: 201 })

  } catch (error: any) {
    console.error('ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
