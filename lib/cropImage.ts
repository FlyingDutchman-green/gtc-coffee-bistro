export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * HD-quality image crop export.
 *
 * The output canvas is upscaled so the shorter side of the crop region
 * is at least HD_MIN_PX pixels wide, preserving the exact crop aspect ratio.
 * This ensures crisp, publication-ready images regardless of the source
 * image's native resolution.
 *
 * Adapted from https://github.com/DominicTobias/react-image-crop
 */

/** Minimum output width in pixels for HD quality. */
const HD_MIN_PX = 1200

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // Set canvas size to match the bounding box (for rotation/flip pass)
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Translate canvas context to center for rotating and flipping
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw rotated image
  ctx.drawImage(image, 0, 0)

  // Extract the cropped region from the rotated canvas
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // ── HD Upscale ──────────────────────────────────────────────────────────────
  // Scale up so the output width is at least HD_MIN_PX while preserving ratio.
  const aspectRatio = pixelCrop.width / pixelCrop.height
  const outputWidth = Math.max(pixelCrop.width, HD_MIN_PX)
  const outputHeight = Math.round(outputWidth / aspectRatio)

  // Resize the canvas to the HD output dimensions
  canvas.width = outputWidth
  canvas.height = outputHeight

  // Draw the extracted crop data scaled to HD dimensions
  // We create an offscreen temp canvas to hold the raw extracted data,
  // then draw it scaled up into the final HD canvas.
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = pixelCrop.width
  tempCanvas.height = pixelCrop.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return null
  tempCtx.putImageData(data, 0, 0)

  ctx.drawImage(tempCanvas, 0, 0, outputWidth, outputHeight)
  // ────────────────────────────────────────────────────────────────────────────

  // Export as high-quality JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (file) => {
        if (file) {
          resolve(new File([file], 'cropped_image.jpg', { type: 'image/jpeg' }))
        } else {
          reject(new Error('Canvas is empty'))
        }
      },
      'image/jpeg',
      0.95 // 0.95 — premium HD crispness
    )
  })
}
