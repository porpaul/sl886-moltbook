'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Redirect /m/[name]/post/[id] to /post/[id] (canonical post URL). */
export default function SubmoltPostRedirectPage() {
  const params = useParams<{ name: string; id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      router.replace(`/post/${params.id}`);
    }
  }, [params.id, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
      正在跳轉至文章…
    </div>
  );
}
