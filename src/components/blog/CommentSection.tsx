'use client';

import Giscus from '@giscus/react';

interface CommentSectionProps {
  slug: string;
}

/**
 * CommentSection component using giscus (GitHub Discussions based comments)
 * Comments are stored in: https://github.com/Spectra-Audit/resh-community-comments
 */
export function CommentSection({ slug }: CommentSectionProps) {
  return (
    <div className="comment-section mt--60">
      <h3 className="title mb--30">Comments</h3>
      <Giscus
        id="comments"
        repo="Spectra-Audit/resh-community-comments"
        repoId="R_kgDORAb1jQ"
        category="General"
        categoryId="DIC_kwDORAb1jc4C1X6u"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="light"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
