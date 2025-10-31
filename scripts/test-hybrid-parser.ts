import { GoogleSerpHybrid } from '../lib/parsers/serp/google-serp-hybrid';

async function main() {
  console.log('🧪 RefSpy Hybrid Parser Test\n');
  console.log('='.repeat(60));

  const parser = new GoogleSerpHybrid();

  // Test 1: Auto mode (сначала попробует Google CSE)
  console.log('\n📦 Test 1: Auto Mode (Hybrid)');
  console.log('-'.repeat(60));
  
  try {
    const results = await parser.search({
      keyword: 'best running shoes',
      location: 'us',
      resultsCount: 5,
    });

    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results:\n`);
      results.slice(0, 3).forEach(r => {
        console.log(`  ${r.position}. ${r.domain}`);
        console.log(`     ${r.title}\n`);
      });
    } else {
      console.log('⚠️ No results found');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Статистика
  console.log('\n📊 Usage Statistics');
  console.log('-'.repeat(60));
  const stats = parser.getUsageStats();
  console.log(JSON.stringify(stats, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!\n');
}

main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
