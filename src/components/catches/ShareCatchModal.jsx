import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

const ShareCatchModal = ({ catchData, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [shareImage, setShareImage] = useState(null);
  const canvasRef = useRef(null);

  // Generate share text
  const getShareText = () => {
    const lines = [
      `🎣 Just caught a ${catchData.speciesName || catchData.species}!`,
    ];
    
    if (catchData.weight) {
      lines.push(`⚖️ Weight: ${catchData.weight} lbs`);
    }
    if (catchData.length) {
      lines.push(`📏 Length: ${catchData.length}"`);
    }
    if (catchData.locationName) {
      lines.push(`📍 Location: ${catchData.locationName}`);
    }
    if (catchData.baitUsed) {
      lines.push(`🪱 Bait: ${catchData.baitUsed}`);
    }
    
    lines.push('');
    lines.push('#fishing #catchoftheday #louisianafishing #tightlines');
    
    return lines.join('\n');
  };

  const shareText = getShareText();
  const shareUrl = `${window.location.origin}/catches`;

  // Generate shareable image with catch details overlay
  useEffect(() => {
    if (catchData.photo) {
      generateShareImage();
    }
  }, [catchData]);

  const generateShareImage = async () => {
    if (!catchData.photo) return;
    
    setGeneratingImage(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas size
        const maxWidth = 1080;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Add gradient overlay at bottom
        const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        
        // Species name
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.fillText(`🎣 ${catchData.speciesName || catchData.species}`, 24, height - 100);
        
        // Stats line
        const stats = [];
        if (catchData.weight) stats.push(`${catchData.weight} lbs`);
        if (catchData.length) stats.push(`${catchData.length}"`);
        if (stats.length > 0) {
          ctx.font = '24px system-ui, -apple-system, sans-serif';
          ctx.fillText(stats.join(' • '), 24, height - 60);
        }
        
        // Location
        if (catchData.locationName) {
          ctx.font = '20px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`📍 ${catchData.locationName}`, 24, height - 28);
        }
        
        // Add watermark
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('South LA Fishing App', width - 16, height - 12);
        
        // Get data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setShareImage(dataUrl);
        setGeneratingImage(false);
      };
      
      img.onerror = () => {
        setGeneratingImage(false);
      };
      
      img.src = catchData.photo;
    } catch (error) {
      console.error('Error generating share image:', error);
      setGeneratingImage(false);
    }
  };

  // Native share (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData = {
          title: `Caught a ${catchData.speciesName || catchData.species}!`,
          text: shareText,
          url: shareUrl
        };
        
        // Try to share with image if available
        if (shareImage && navigator.canShare) {
          const response = await fetch(shareImage);
          const blob = await response.blob();
          const file = new File([blob], 'catch.jpg', { type: 'image/jpeg' });
          
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }
        
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  // Facebook share
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Twitter/X share
  const shareToTwitter = () => {
    const text = `🎣 Just caught a ${catchData.speciesName || catchData.species}!${catchData.weight ? ` ⚖️ ${catchData.weight} lbs` : ''}${catchData.locationName ? ` 📍 ${catchData.locationName}` : ''}\n\n#fishing #catchoftheday`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Pinterest share (requires image)
  const shareToPinterest = () => {
    const imageUrl = shareImage || catchData.photo || '';
    const description = shareText;
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // WhatsApp share
  const shareToWhatsApp = () => {
    const text = `${shareText}\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Messenger share
  const shareToMessenger = () => {
    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Email share
  const shareViaEmail = () => {
    const subject = `Check out my catch! ${catchData.speciesName || catchData.species}`;
    const body = `${shareText}\n\nView more at: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Download image
  const downloadImage = () => {
    if (shareImage) {
      const link = document.createElement('a');
      link.download = `catch-${catchData.speciesName || 'fish'}-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = shareImage;
      link.click();
    } else if (catchData.photo) {
      const link = document.createElement('a');
      link.download = `catch-${catchData.speciesName || 'fish'}.jpg`;
      link.href = catchData.photo;
      link.click();
    }
  };

  // Copy image to clipboard (for Instagram)
  const copyImageToClipboard = async () => {
    try {
      const imageToUse = shareImage || catchData.photo;
      if (!imageToUse) return;
      
      const response = await fetch(imageToUse);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert('Image copied! Open Instagram and paste to share.');
    } catch (error) {
      console.error('Failed to copy image:', error);
      // Fallback to downloading
      downloadImage();
      alert('Image downloaded! Open Instagram and upload the image.');
    }
  };

  const socialButtons = [
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      onClick: shareToFacebook
    },
    {
      name: 'Twitter / X',
      icon: '🐦',
      color: '#000000',
      onClick: shareToTwitter
    },
    {
      name: 'Instagram',
      icon: '📷',
      color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      onClick: copyImageToClipboard,
      subtitle: 'Copy image to share'
    },
    {
      name: 'Pinterest',
      icon: '📌',
      color: '#E60023',
      onClick: shareToPinterest,
      disabled: !catchData.photo
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      onClick: shareToWhatsApp
    },
    {
      name: 'Messenger',
      icon: '💌',
      color: '#0084FF',
      onClick: shareToMessenger
    },
    {
      name: 'Email',
      icon: '✉️',
      color: '#6B7280',
      onClick: shareViaEmail
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
            📤 Share Your Catch
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        <div style={{ padding: '20px 24px' }}>
          {/* Image preview */}
          {(shareImage || catchData.photo) && (
            <div style={{
              marginBottom: '16px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <img 
                src={shareImage || catchData.photo}
                alt="Catch preview"
                style={{
                  width: '100%',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* Hidden canvas for image generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Text preview */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#374151',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            {shareText}
          </div>

          {/* Native share button (shows on mobile) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              style={{
                width: '100%',
                marginBottom: '16px',
                padding: '14px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}
            >
              📱 Share...
            </Button>
          )}

          {/* Social media grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '10px',
            marginBottom: '16px'
          }}>
            {socialButtons.map((social) => (
              <button
                key={social.name}
                onClick={social.onClick}
                disabled={social.disabled}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '14px 8px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#f3f4f6',
                  cursor: social.disabled ? 'not-allowed' : 'pointer',
                  opacity: social.disabled ? 0.5 : 1,
                  transition: 'transform 0.2s, background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!social.disabled) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: '28px' }}>{social.icon}</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#374151',
                  textAlign: 'center'
                }}>
                  {social.name}
                </span>
                {social.subtitle && (
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    {social.subtitle}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Additional actions */}
          <div style={{
            display: 'flex',
            gap: '10px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px'
          }}>
            <Button
              variant="secondary"
              onClick={copyToClipboard}
              style={{ flex: 1, fontSize: '14px' }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Text'}
            </Button>
            
            {(shareImage || catchData.photo) && (
              <Button
                variant="secondary"
                onClick={downloadImage}
                style={{ flex: 1, fontSize: '14px' }}
              >
                💾 Save Image
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCatchModal;






