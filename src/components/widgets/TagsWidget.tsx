import Link from 'next/link';
import { getAllTags } from '@/lib/content';

async function getPopularTags() {
  const tags = await getAllTags();
  // Sort by count and get top 20
  return tags.sort((a, b) => b.count - a.count).slice(0, 20);
}

export async function TagsWidget() {
  const tags = await getPopularTags();

  return (
    <div className="axil-single-widget mt--30 mt_sm--30 mt_md--30">
      <h5 className="widget-title">Popular Tags</h5>
      <div className="tagcloud">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="axil-button-label btn-fill-primary"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
