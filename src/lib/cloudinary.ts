import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  folder: string;
}

export async function uploadImage(
  file: File | Buffer,
  folder: string = 'meranti-report'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              folder: result.folder || folder,
            });
          } else reject(new Error('Upload failed'));
        }
      )
      .end(file);
  });
}

export function getCloudinaryImageUrl(
  publicId: string,
  transformations: Record<string, string | number>[] = []
): string {
  const defaultTransforms = [{ quality: 'auto', fetch_format: 'auto' }];
  return cloudinary.url(publicId, {
    transformation: [...defaultTransforms, ...transformations],
    secure: true,
  });
}

export function getThumbnailUrl(publicId: string, width: number = 400, height: number = 300): string {
  return getCloudinaryImageUrl(publicId, [
    { width, height, crop: 'fill', gravity: 'auto' },
  ]);
}

export function getHeroImageUrl(publicId: string, width: number = 1200, height: number = 600): string {
  return getCloudinaryImageUrl(publicId, [
    { width, height, crop: 'fill', gravity: 'auto' },
  ]);
}

export function getCardImageUrl(publicId: string, width: number = 600, height: number = 400): string {
  return getCloudinaryImageUrl(publicId, [
    { width, height, crop: 'fill', gravity: 'auto' },
  ]);
}

export function getOgImageUrl(publicId: string, width: number = 1200, height: number = 630): string {
  return getCloudinaryImageUrl(publicId, [
    { width, height, crop: 'fill', gravity: 'auto' },
  ]);
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

/**
 * Delete a resource from Cloudinary by publicId.
 * Supports both image and video resource types.
 */
export async function deleteResource(publicId: string, resourceType: string = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType === 'video' ? 'video' : 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
}

export function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : '';
}
