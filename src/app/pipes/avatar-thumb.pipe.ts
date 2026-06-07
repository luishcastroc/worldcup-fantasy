import { Pipe, PipeTransform } from '@angular/core';

/**
 * Rewrites a Cloudinary delivery URL to return a square, face-aware,
 * auto-format/quality thumbnail at the requested CSS size (retina via dpr_auto).
 * Non-Cloudinary URLs (e.g. Google OAuth avatars) are returned unchanged.
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/abc.jpg
 *   → https://res.cloudinary.com/<cloud>/image/upload/c_fill,g_auto,w_40,h_40,f_auto,q_auto,dpr_auto/v123/abc.jpg
 */
@Pipe({ name: 'avatarThumb', standalone: true })
export class AvatarThumbPipe implements PipeTransform {
  transform(url: string | null | undefined, size = 96): string | null {
    if (!url) return url ?? null;

    const marker = '/image/upload/';
    const i = url.indexOf(marker);
    if (i === -1) return url; // not a Cloudinary delivery URL — leave as-is

    const head = url.slice(0, i + marker.length);
    const tail = url.slice(i + marker.length);
    if (tail.startsWith('c_fill')) return url; // already transformed

    const t = `c_fill,g_auto,w_${size},h_${size},f_auto,q_auto,dpr_auto`;
    return `${head}${t}/${tail}`;
  }
}
