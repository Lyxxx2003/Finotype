
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
}

export const generateShareImage = async (options: ShareImageOptions) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        alert("Could not create canvas context");
        return;
    };

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

    // Mascot emoji (large)
    ctx.font = 'bold 280px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(options.mascot, canvas.width / 2, 420);

    // Title text
    ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(options.title, canvas.width / 2, 680);

    // Website URL
    ctx.font = '48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(options.subtitle, canvas.width / 2, 820);

    // Small branding at bottom
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(options.brandText, canvas.width / 2, 950);

    // Convert to blob and share
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
          console.log('Share canceled or failed', err);
        }
      } else {
        // Fallback download
        const link = document.createElement('a');
        link.download = options.filename;
        link.href = canvas.toDataURL();
        link.click();
      }
    }, 'image/png');
  } catch (err) {
    console.error('Failed to generate share image', err);
    alert('Failed to generate share image. Please try again.');
  }
};
