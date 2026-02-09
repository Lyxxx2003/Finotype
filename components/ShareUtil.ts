
export interface ShareImageOptions {
  width?: number;
  height?: number;
  gradientColors: [string, string];
  circleColor1: string;
  circleColor2: string;
  mascot: string;
  title: string;
  titleFontSize?: number;
  subtitle: string;
  brandText: string;
  filename: string;
  shareTitle: string;
  shareText: string;
  shareUrl?: string; // For link sharing
}

const createCanvas = (options: ShareImageOptions): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  const width = options.width ?? 1080;
  const height = options.height ?? 1080;
  const titleFontSize = options.titleFontSize ?? 64;

  canvas.width = width;
  canvas.height = height;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, options.gradientColors[0]);
  gradient.addColorStop(1, options.gradientColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative circles
  ctx.fillStyle = options.circleColor1;
  ctx.beginPath();
  ctx.arc(150, 150, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = options.circleColor2;
  ctx.beginPath();
  ctx.arc(900, 900, 250, 0, Math.PI * 2);
  ctx.fill();

  // Title text
  ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.title, canvas.width / 2, 680);

  // Website URL
  ctx.font = '48px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(options.subtitle, canvas.width / 2, 820);

  // Small branding at bottom
  ctx.font = '28px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(options.brandText, canvas.width / 2, 950);

  return canvas;
};

const loadAndDrawMascot = (canvas: HTMLCanvasElement, mascotPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('No canvas context'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw mascot image in a circle
      const size = 280;
      const x = canvas.width / 2;
      const y = 420;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      ctx.restore();
      
      resolve();
    };
    img.onerror = () => {
      // Fallback to text if image fails
      ctx.font = 'bold 280px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💰', canvas.width / 2, 420);
      resolve();
    };
    img.src = mascotPath.startsWith('/') ? mascotPath : `/${mascotPath}`;
  });
};

export const generateShareImage = async (options: ShareImageOptions) => {
  try {
    const canvas = createCanvas(options);
    await loadAndDrawMascot(canvas, options.mascot);

    // Convert to blob and share (Messages, Email, AirDrop on macOS/iOS)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Could not generate image");
        return;
      }

      const file = new File([blob], options.filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: options.shareTitle,
            text: options.shareText,
            files: [file]
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.log('Share failed', err);
          }
        }
      } else {
        alert('Sharing is not supported on this device. Please use the Download button instead.');
      }
    }, 'image/png');
  } catch (err) {
    console.error('Failed to generate share image', err);
    alert('Failed to generate share image. Please try again.');
  }
};

export const downloadShareImage = async (options: ShareImageOptions) => {
  try {
    const canvas = createCanvas(options);
    await loadAndDrawMascot(canvas, options.mascot);
    const link = document.createElement('a');
    link.download = options.filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Failed to download image', err);
    alert('Failed to download image. Please try again.');
  }
};

// Copy share link to clipboard
export const copyShareLink = async (shareUrl: string) => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (err) {
    console.error('Failed to copy link', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Share to X (Twitter)
export const shareToX = async (options: ShareImageOptions) => {
  // X doesn't support direct image upload via URL, so we open with text and URL
  // Users can manually attach the downloaded image
  const text = encodeURIComponent(options.shareText);
  const url = encodeURIComponent(options.shareUrl || window.location.href);
  const xUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  window.open(xUrl, '_blank', 'width=550,height=420');
};

// Share to Facebook
export const shareToFacebook = async (options: ShareImageOptions) => {
  const url = encodeURIComponent(options.shareUrl || window.location.href);
  const quote = encodeURIComponent(options.shareText);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
};

// Native share (works on macOS/iOS and other supporting browsers)
export const nativeShare = async (options: ShareImageOptions) => {
  try {
    const canvas = createCanvas(options);
    await loadAndDrawMascot(canvas, options.mascot);

    // Convert to blob and share (Messages, Email, AirDrop on macOS/iOS)
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate image");
          resolve(false);
          return;
        }

        const file = new File([blob], options.filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: options.shareTitle,
              text: options.shareText,
              files: [file]
            });
            resolve(true);
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.log('Share failed', err);
            }
            resolve(false);
          }
        } else {
          // Fallback to URL sharing if file sharing is not supported
          if (navigator.share) {
            try {
              await navigator.share({
                title: options.shareTitle,
                text: options.shareText,
                url: options.shareUrl || window.location.href,
              });
              resolve(true);
            } catch (err) {
              if ((err as Error).name !== 'AbortError') {
                console.log('Share failed', err);
              }
              resolve(false);
            }
          } else {
            alert('Sharing is not supported on this device. Please use the Download button instead.');
            resolve(false);
          }
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Failed to generate share image', err);
    alert('Failed to generate share image. Please try again.');
    return false;
  }
};
