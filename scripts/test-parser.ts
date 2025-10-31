import { ParserOrchestrator } from '../lib/parsers/core/parser-orchestrator';
import { ProxyManager } from '../lib/parsers/utils/proxy-manager';

async function main() {
  console.log('🧪 RefSpy Parser Test Suite\n');
  console.log('='.repeat(50));

  // Test 1: Proxy Manager (быстрый тест)
  console.log('\n📦 Test 1: Proxy Manager (Quick Check)');
  console.log('-'.repeat(50));
  
  const proxyManager = new ProxyManager();
  console.log('✅ Proxy Manager initialized');

  // Test 2: Parser Orchestrator
  console.log('\n📦 Test 2: Google SERP Parser');
  console.log('-'.repeat(50));
  
  const orchestrator = new ParserOrchestrator();
  
  try {
    const results = await orchestrator.analyzeCompetitors({
      keyword: 'best running shoes',
      location: 'us',
      competitorsCount: 5,
    });

    console.log(`\n📊 Results:`);
    results.forEach(r => {
      console.log(`  ${r.position}. ${r.domain}`);
      console.log(`     ${r.title}`);
      console.log(`     ${r.url}\n`);
    });

    // Показываем статистику
    console.log('\n📊 Usage Statistics:');
    const stats = orchestrator.getStats();
    console.log(JSON.stringify(stats, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  console.log('='.repeat(50));
  console.log('✅ All tests completed!\n');
}

main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
