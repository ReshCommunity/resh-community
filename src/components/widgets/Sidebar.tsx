import { RecentPostsWidget } from './RecentPostsWidget';
import { CategoriesWidget } from './CategoriesWidget';
import { TagsWidget } from './TagsWidget';
import { NewsletterWidget } from './NewsletterWidget';

interface SidebarProps {
  showRecentPosts?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  showNewsletter?: boolean;
}

export function Sidebar({
  showRecentPosts = true,
  showCategories = true,
  showTags = true,
  showNewsletter = true,
}: SidebarProps) {
  return (
    <aside className="axil-blog-sidebar">
      {showRecentPosts && <RecentPostsWidget />}
      {showCategories && <CategoriesWidget />}
      {showTags && <TagsWidget />}
      {showNewsletter && <NewsletterWidget />}
    </aside>
  );
}
