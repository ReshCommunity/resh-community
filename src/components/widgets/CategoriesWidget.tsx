import Link from 'next/link';
import { getAllCategories } from '@/lib/content';

async function getCategoriesWithCount() {
  const categories = await getAllCategories();
  return categories.slice(0, 10);
}

export async function CategoriesWidget() {
  const categories = await getCategoriesWithCount();

  return (
    <div className="axil-single-widget mt--30 mt_sm--30 mt_md--30">
      <h5 className="widget-title">Categories</h5>
      <ul className="category-list liststyle">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/category/${category.slug}`}>
              {category.name}
              <span className="float-right">({category.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
