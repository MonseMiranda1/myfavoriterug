interface YouTubeVideoProps {
  url: string;
}

export default function YouTubeVideo({ url }: YouTubeVideoProps) {
  if (!url) {
    return <div className="error-message">URL de YouTube no válida</div>;
  }

  return (
    <div className="youtube-video-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="YouTube Video"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      ></iframe>
    </div>
  );
}
