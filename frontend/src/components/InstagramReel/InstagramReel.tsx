interface InstagramReelProps {
  url: string;
}

export default function InstagramReel({ url }: InstagramReelProps) {
  const getReelId = (url: string) => {
    const patterns = [
      /instagram\.com\/reel\/([^/?]+)/,
      /instagram\.com\/p\/([^/?]+)/,
      /instagr\.am\/([^/?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const reelId = getReelId(url);
  
  if (!reelId) {
    return <div className="error-message">URL de Instagram no válida</div>;
  }

  return (
  <div className="instagram-reel-container" style={{ width: '100%', height: '100%' }}>
    <iframe
      src={`https://www.instagram.com/reel/${reelId}/embed`}
      width="100%"
      height="100%"
      frameBorder="0"
      scrolling="no"
      allowTransparency={true}
      allow="encrypted-media"
      title="Instagram Reel"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    ></iframe>
  </div>
    ) 
}