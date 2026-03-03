/**
 * Schema Markup Verification Script
 * Run with: npx tsx src/lib/__tests__/schema.test.ts
 */

import { extractFAQs } from '../schema';

// Test FAQ extraction
const testContent = `
# Test Article

Some content here...

## Frequently Asked Questions

### Q: What is Bitcoin?
A: Bitcoin is a decentralized digital currency without a central bank.

### Q: How do I buy crypto?
A: You can buy cryptocurrency on exchanges like Binance or Coinbase.

More content...
`;

const faqs = extractFAQs(testContent);
console.log('✅ Extracted FAQs:', faqs);
console.log('Found', faqs.length, 'FAQs');

if (faqs.length === 2) {
  console.log('✅ FAQ extraction working correctly');
} else {
  console.log('❌ FAQ extraction may have issues');
}

// Test with content that has no FAQs
const noFAQContent = `
# Simple Article

Just some content without any FAQ sections.
`;

const noFAQs = extractFAQs(noFAQContent);
console.log('\n✅ Content without FAQs:', noFAQs.length === 0 ? 'Correctly returns empty array' : 'Unexpected result');
