import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/** Error thrown when a chosen file fails client-side validation. */
export class AvatarValidationError extends Error {}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  /**
   * Uploads an image to Cloudinary using an unsigned upload preset and returns
   * the delivered secure URL. Validates type and size client-side first.
   */
  async uploadAvatar(file: File): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new AvatarValidationError('Formato no válido. Usa JPG, PNG o WebP.');
    }
    if (file.size > MAX_BYTES) {
      throw new AvatarValidationError('La imagen es muy grande. Máximo 5 MB.');
    }

    const cloudName = environment.cloudinaryCloudName;
    const preset = environment.cloudinaryUploadPreset;
    if (!cloudName || !preset) {
      throw new Error('Cloudinary no está configurado.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData },
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url as string;
  }
}
