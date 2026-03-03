#!/usr/bin/env tsx

/**
 * Create manual image-to-post mapping based on keyword matching
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const UPLOADS_DIR = path.join(
  '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/wp-content'
);
const CONTENT_DIR = path.join(__dirname, '../content');

// Unique images (excluding resized versions)
const UNIQUE_IMAGES = [
  'Bitcoin_formula.png',
  'Ethereum-foundation-specifies-444m-1024x576.webp',
  'FTX-Japan-Resumes-ithdrawals.webp',
  'Untitled.webp',
  'defillama-1.webp',
  'defillama.webp',
  'scmp-calls-for-crypto-regulations-1024x538.webp',
  'scmp-calls-for-crypto-regulations.webp',
  'Do-Kwon-is-in-Serbia-as-per-reports.jpg',
  'Ethereum-Developers-Shinghai-Upgrade-1.png',
  'Coinbase-ceo-brian-armstrong-sbf-ftx.jpg',
  'FTX-Founder-SBF.webp',
  'FTX-Collapse-Crypto.jpg',
];

// Manual mapping based on content analysis
const MANUAL_MAPPING: Record<string, { image: string; reason: string }> = {
  // Ethereum Foundation
  'ethereum-foundation-specifies-444m': {
    image: '/uploads/2022/12/Ethereum-foundation-specifies-444m-1024x576.webp',
    reason: 'Direct slug match (post exists in DB but not exported)',
  },
  'ethereum-developers-to-release-shanghai-hard-fork-in-march-2023': {
    image: '/uploads/2022/12/Ethereum-Developers-Shinghai-Upgrade-1.png',
    reason: 'Ethereum developers topic',
  },

  // Bitcoin / Trading
  'bitcoin_formula': {
    image: '/uploads/2022/12/Bitcoin_formula.png',
    reason: 'Direct slug match (post exists in DB but not exported)',
  },
  'what-is-a-short-squeeze-in-crypto': {
    image: '/uploads/2022/12/Bitcoin_formula.png',
    reason: 'Trading/finance topic',
  },

  // Coinbase
  'coinbase-ceo-brian-armstrong-sbf-ftx': {
    image: '/uploads/2022/12/Coinbase-ceo-brian-armstrong-sbf-ftx.jpg',
    reason: 'Direct slug match (post exists in DB but not exported)',
  },
  'coinbase-ceo-asserts-sbfs-accounting-error-for-8b-does-not-justify-against-scrutiny': {
    image: '/uploads/2022/12/Coinbase-ceo-brian-armstrong-sbf-ftx.jpg',
    reason: 'Coinbase CEO topic',
  },

  // FTX Related
  'alameda-has-an-access-to-trading-on-ftx-us-cftc': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'FTX/Alameda topic',
  },
  'alameda-reportedly-rescued-ftx-in-2021-sbf-denies-knowing': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'Alameda/FTX topic',
  },
  'ftx-collapse-separating-crypto-and-banking-system-would-be-stupidity': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'FTX collapse topic',
  },
  'ftx-founder-denies-committing-any-fraud': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'FTX founder topic',
  },
  'ftx-japan-considers-restarting-withdrawals-to-give-back-funds-to-the-clients': {
    image: '/uploads/2022/12/FTX-Japan-Resumes-ithdrawals.webp',
    reason: 'FTX Japan topic',
  },
  'ftx-reveals-all-alameda-investment-portfolios-5-4b-in-total': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'Alameda/FTX topic',
  },
  'ftx-saga-the-downfall-of-the-crypto-empire-of-sbf': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'SBF/FTX saga topic',
  },
  'ftx-seeks-court-permission-to-sell-off-4-businesses': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'FTX business/collapse topic',
  },
  'ftxs-latest-ceo-distorted-the-bahamian-authorities-measures-says-the-attorney-general': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'FTX CEO topic',
  },
  'sbf-gets-arrested-in-the-bahamas-on-criminal-charges': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'SBF arrest topic',
  },
  'sbf-secretly-funded-crypto-news-website': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'SBF topic',
  },
  'sbt-lets-break-it-down-to-you': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'SBT likely typo for SBF',
  },
  'silvergate-bank-confirms-adequate-liquidity-after-ftx-debacle': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'FTX contagion topic',
  },
  'blockfi-submits-a-bankruptcy-filing-as-crypto-industry-gets-engulfed-in-ftx-contagion': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'FTX contagion/blockfi topic',
  },
  'mas-issues-statement-to-deal-with-the-misconceptions-after-the-ftx-debacle': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'FTX aftermath topic',
  },
  'turkey-starts-investigation-on-former-ftx-ceo': {
    image: '/uploads/2022/12/FTX-Founder-SBF.webp',
    reason: 'FTX CEO topic',
  },

  // DeFi / DeFiLlama
  'defi-lending-and-venus-protocol-on-bnb-chain': {
    image: '/uploads/2022/12/defillama-1.webp',
    reason: 'DeFi topic (DeFiLlama image)',
  },
  'defi-a-free-financial-market-that-doesnt-sleep': {
    image: '/uploads/2022/12/defillama.webp',
    reason: 'DeFi topic',
  },
  'best-free-defi-yield-farming-analytics-tool-vfat-tools': {
    image: '/uploads/2022/12/defillama-1.webp',
    reason: 'DeFi analytics topic',
  },
  'top-3-defi-analytics-platforms-2022': {
    image: '/uploads/2022/12/defillama-1.webp',
    reason: 'DeFi analytics topic',
  },
  'is-defi-legal-dec-2022': {
    image: '/uploads/2022/12/defillama.webp',
    reason: 'DeFi topic',
  },

  // Terra / LUNA
  'terra-luna-the-crash': {
    image: '/uploads/2022/12/FTX-Collapse-Crypto.jpg',
    reason: 'Crash/collapse topic (reuse FTX image)',
  },
  'stablecoin-the-terrifying-technology': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Stablecoin topic (generic placeholder)',
  },

  // Do Kwon / Terra
  'do-kwon-of-terraform-labs-is-now-in-serbia-reports': {
    image: '/uploads/2022/12/Do-Kwon-is-in-Serbia-as-per-reports.jpg',
    reason: 'Do Kwon topic',
  },

  // SCMP / Regulation
  'scmp-editorial-of-hong-kong-calls-for-additional-crypto-regulations-after-ftx-collapse': {
    image: '/uploads/2022/12/scmp-calls-for-crypto-regulations-1024x538.webp',
    reason: 'SCMP regulation topic',
  },

  // Generic placeholders for topics without specific images
  'best-crypto-communities-to-follow-in-2022': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Community topic (generic placeholder)',
  },
  'best-crypto-youtube-accounts-to-follow': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Social media topic (generic placeholder)',
  },
  'best-crypto-instagram-accounts-to-follow-in-2022': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Social media topic (generic placeholder)',
  },
  'best-proven-crypto-social-media-accounts-to-follow-in-2022-twitter-edition': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Social media topic (generic placeholder)',
  },
  'best-crypto-social-media-accounts-to-follow-facebook-edition': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Social media topic (generic placeholder)',
  },
  'best-crypto-social-media-accounts-to-follow-in-2022-reddit': {
    image: '/uploads/2022/12/Untitled.webp',
    reason: 'Social media topic (generic placeholder)',
  },
};

// Fallback: use Untitled.webp for remaining posts
const FALLBACK_IMAGE = '/uploads/2022/12/Untitled.webp';

/**
 * Update MDX file with featured image
 */
function updateMDXFeaturedImage(filePath: string, featuredImage: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);

  // Only update if empty
  if (data.featured_image && data.featured_image !== '') {
    return false;
  }

  data.featured_image = featuredImage;

  // Rebuild frontmatter
  let newFrontmatter = '---\n';
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (key === 'seo' || key === 'opengraph' || key === 'twitter') {
      newFrontmatter += `${key}:\n`;
      const obj = value as Record<string, any>;
      for (const [subKey, subValue] of Object.entries(obj)) {
        if (subValue === undefined || subValue === null || subValue === '') continue;
        if (typeof subValue === 'string') {
          newFrontmatter += `  ${subKey}: "${subValue}"\n`;
        } else {
          newFrontmatter += `  ${subKey}: ${subValue}\n`;
        }
      }
    } else if (Array.isArray(value)) {
      newFrontmatter += `${key}: [${value.map((v: any) => `"${v}"`).join(', ')}]\n`;
    } else if (typeof value === 'string') {
      const escapedValue = value.replace(/"/g, '\\"');
      newFrontmatter += `${key}: "${escapedValue}"\n`;
    } else if (typeof value === 'boolean') {
      newFrontmatter += `${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      newFrontmatter += `${key}: ${value}\n`;
    }
  }
  newFrontmatter += '---\n\n';

  const newContent = newFrontmatter + markdown;
  fs.writeFileSync(filePath, newContent);

  return true;
}

/**
 * Main function
 */
async function applyManualMapping() {
  console.log('📝 Applying manual image mapping...\n');

  const postsDir = path.join(CONTENT_DIR, 'posts');
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));

  let updated = 0;
  let skipped = 0; // Already has image
  let notFound = 0; // No mapping

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let data;
    try {
      ({ data } = matter(content));
    } catch (e) {
      console.log(`⚠ Skipping ${file} due to YAML parse error`);
      continue;
    }

    const slug = data.slug || file.replace('.mdx', '');
    const currentImage = data.featured_image || '';

    // Skip if already has image
    if (currentImage !== '') {
      skipped++;
      continue;
    }

    // Check manual mapping
    if (slug in MANUAL_MAPPING) {
      const { image, reason } = MANUAL_MAPPING[slug];
      updateMDXFeaturedImage(filePath, image);
      console.log(`✓ ${file}`);
      console.log(`  → ${image}`);
      console.log(`  (${reason})\n`);
      updated++;
    } else {
      // Use fallback
      updateMDXFeaturedImage(filePath, FALLBACK_IMAGE);
      console.log(`⚠ ${file} → ${FALLBACK_IMAGE} (fallback)`);
      notFound++;
    }
  }

  console.log(`\n✓ Updated ${updated} posts`);
  console.log(`✓ Skipped ${skipped} posts (already have images)`);
  console.log(`⚠ Used fallback for ${notFound} posts`);
  console.log('\n✓ Manual mapping complete!');
}

// Run the mapping
applyManualMapping().catch(console.error);
