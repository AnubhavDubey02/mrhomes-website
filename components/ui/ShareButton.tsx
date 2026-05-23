'use client';

import { useState, useEffect } from 'react';

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    const url = shareUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this property on Mr Homes: ${title}`,
          url,
        });
      } catch (err) {
        // User cancelling share is expected, log other errors
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn btn-ghost justify-center min-w-[140px]"
    >
      {copied ? 'Link Copied' : 'Share Property'}
    </button>
  );
}
