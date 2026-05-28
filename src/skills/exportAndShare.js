import html2canvas from 'html2canvas';

export const exportAndShare = async (elementId, filename = 'leadership-style-result.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      // html2canvas only accepts a hex literal — this is the primary cream
      // (`bg-primary` / `quiz-bg` in tailwind.config.js, design.md §2.1).
      backgroundColor: '#FFF9EF',
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }

      const file = new File([blob], filename, { type: 'image/png' });

      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Leadership Style',
            text: 'Check out my Leadership Style Profile!',
            files: [file]
          });
          return;
        } catch (shareError) {
          console.error("Error sharing:", shareError);
          // Fallback to download if user cancels or share fails
          downloadFallback(blob, filename);
        }
      } else {
        // Fallback to download
        downloadFallback(blob, filename);
      }
    }, 'image/png');
  } catch (error) {
    console.error("Error generating image:", error);
  }
};

function downloadFallback(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
