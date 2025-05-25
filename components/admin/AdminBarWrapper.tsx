'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminBar from './AdminBar';

interface AdminBarWrapperProps {
  isPreviewMode: boolean;
}

export default function AdminBarWrapper({ isPreviewMode }: AdminBarWrapperProps) {
  const pathname = usePathname();
  const [postId, setPostId] = useState<string | undefined>(undefined);
  const [postType, setPostType] = useState<string | undefined>(undefined);

  // Extract post ID from DOM elements with Contentful entry IDs
  useEffect(() => {
    // Check for landing page (including homepage)
    // Landing pages use the main element with data-post-id attribute
    const mainElement = document.querySelector('main[data-post-id]');
    if (mainElement) {
      const id = mainElement.getAttribute('data-post-id');
      const type = mainElement.getAttribute('data-post-type') || 'landing';
      if (id) {
        setPostId(id);
        setPostType(type);
        return;
      }
    }

    // Check for article with data-post-id attribute
    const articleElement = document.querySelector('article[data-post-id]');
    if (articleElement) {
      const id = articleElement.getAttribute('data-post-id');
      if (id) {
        setPostId(id);
        setPostType('article');
        return;
      }
    }

    // Check for basic page with data-page-id attribute
    const pageElement = document.querySelector('article[data-page-id]');
    if (pageElement) {
      const id = pageElement.getAttribute('data-page-id');
      if (id) {
        setPostId(id);
        setPostType('page');
        return;
      }
    }

    // Reset if no entry ID found
    setPostId(undefined);
    setPostType(undefined);
  }, [pathname]);

  // Only show AdminBar in preview mode
  if (!isPreviewMode) {
    return null;
  }

  return <AdminBar postId={postId} postType={postType} isPreviewMode={true} />;
}
