import * as dotenv from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// Явно загружаем .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testGoogleCSE() {
  console.log('🧪 Testing Google Custom Search API\n');
  console.log('='.repeat(60));

  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  console.log(`\n🔑 API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ NOT FOUND'}`);
  console.log(`🔑 Search Engine ID: ${cx || '❌ NOT FOUND'}\n`);

  if (!apiKey || !cx) {
    console.error('❌ ERROR: Missing credentials in .env.local');
    console.error('\nPlease check that .env.local exists and contains:');
    console.error('  GOOGLE_CSE_API_KEY=your_key');
    console.error('  GOOGLE_CSE_ID=your_id');
    return;
  }

  const keyword = 'best running shoes';
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(keyword)}&num=5`;

  console.log(`🔍 Searching for: "${keyword}"`);
  console.log(`⏳ Please wait...\n`);

  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const endTime = Date.now();
    
    console.log('✅ SUCCESS!\n');
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Total Results: ${response.data.searchInformation.totalResults}`);
    console.log(`🕐 Search Time: ${response.data.searchInformation.formattedSearchTime}s\n`);
    
    const items = response.data.items || [];
    
    console.log(`📋 Found ${items.length} results:\n`);
    
    items.forEach((item: any, index: number) => {
      const domain = new URL(item.link).hostname.replace('www.', '');
      console.log(`${index + 1}. ${domain}`);
      console.log(`   ${item.title}`);
      console.log(`   ${item.link}`);
      console.log(`   "${item.snippet.substring(0, 100)}..."\n`);
    });

    console.log('🎉 Google Custom Search API is working perfectly!');
    console.log(`💰 You have used 1 of 100 free daily requests.`);

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('\n📋 Error Details:');
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.error?.message || 'Unknown error'}`);
      
      if (error.response.data.error?.errors) {
        console.error('\nDetailed Errors:');
        error.response.data.error.errors.forEach((err: any) => {
          console.error(`  - ${err.domain}: ${err.reason}`);
          console.error(`    ${err.message}`);
        });
      }

      // Подсказки по частым ошибкам
      if (error.response.status === 403) {
        console.error('\n💡 Possible solutions:');
        console.error('  1. Enable Custom Search API:');
        console.error('     https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
        console.error('  2. Check that API key is correct in .env.local');
        console.error('  3. Verify Search Engine ID is correct');
      } else if (error.response.status === 429) {
        console.error('\n💡 You have exceeded the daily quota (100 requests/day)');
        console.error('   Wait until tomorrow or upgrade to paid plan');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!\n');
}

testGoogleCSE();
