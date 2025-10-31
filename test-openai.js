const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: 'sk-or-v1-ВАШ_КЛЮЧ',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://refspy.com',
    'X-Title': 'RefSpy'
  }
})

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1',
      messages: [{ role: 'user', content: 'Привет, ответь JSON: {"ok": 1}' }],
      max_tokens: 16
    })
    console.log('✅ Ответ:', response.choices[0].message.content)
  } catch (e) {
    console.error('❌ Ошибка:', e.message)
  }
}
test()
