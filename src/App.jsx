import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2, Menu, X, ExternalLink, Play } from 'lucide-react';
import './App.css';
import gameData from './data/Gemini3Game.json';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const videoRef = useRef(null);

  // Load favorites from local storage
  useEffect(() => {
    const storedFavs = localStorage.getItem('gemini3_favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }

    // Check URL for shared video
    const params = new URLSearchParams(window.location.search);
    const sharedName = params.get('video');
    if (sharedName) {
      const index = gameData.findIndex(item => item.Name === sharedName);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, []);

  // Update video error state when index changes
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentIndex]);

  const currentItem = gameData[currentIndex];
  const isFavorite = favorites.includes(currentItem.Name);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % gameData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + gameData.length) % gameData.length);
  };

  const toggleFavorite = () => {
    let newFavs;
    if (isFavorite) {
      newFavs = favorites.filter(name => name !== currentItem.Name);
    } else {
      newFavs = [...favorites, currentItem.Name];
    }
    setFavorites(newFavs);
    localStorage.setItem('gemini3_favorites', JSON.stringify(newFavs));
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?video=${currentItem.Name}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setToastMessage('链接已复制到剪贴板！');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        setToastMessage('复制失败，请手动复制链接');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
    } else {
      // Fallback for browsers that don't support clipboard API
      setToastMessage(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVideoError = () => {
    console.log(`Video not found for: ${currentItem.Name}`);
    setVideoError(true);
  };

  const jumpToVideo = (name) => {
    const index = gameData.findIndex(item => item.Name === name);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsFavOpen(false);
    }
  };

  // Get favorite items details
  const favoriteItems = favorites.map(name => gameData.find(item => item.Name === name)).filter(Boolean);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          Gemini3 Games
          <span className="work-count">作品数：{gameData.length}</span>
        </div>
        <div className="header-controls">
          <button
            className="btn-icon"
            onClick={() => setIsFavOpen(!isFavOpen)}
            title="My Favorites"
          >
            {isFavOpen ? <X /> : <Heart fill={favorites.length > 0 ? "#ef4444" : "none"} color={favorites.length > 0 ? "#ef4444" : "currentColor"} />}
          </button>
        </div>
      </header>

      {isFavOpen && (
        <div className="favorites-drawer">
          <h3>My Favorites</h3>
          {favoriteItems.length === 0 ? (
            <div className="empty-state">No favorites yet.</div>
          ) : (
            favoriteItems.map((item) => (
              <div key={item.Name} className="fav-item" onClick={() => jumpToVideo(item.Name)}>
                <span className="fav-name">{item.Name}</span>
                <Play size={16} />
              </div>
            ))
          )}
        </div>
      )}

      <main className="main-content">
        <button className="nav-btn nav-left" onClick={handlePrev}>
          <ChevronLeft size={32} />
        </button>

        <div className="card">
          <div className="video-container">
            {!videoError ? (
              <video
                ref={videoRef}
                className="video-player"
                controls
                autoPlay
                muted // Autoplay usually requires muted
                loop
                src={`/videos/${currentItem.Name}.mp4`}
                onError={handleVideoError}
              />
            ) : (
              <div className="video-placeholder">
                <p>Video not available</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Check console for details)</p>
              </div>
            )}
          </div>

          <div className="info-panel">
            <div className="action-bar">
              <button className={`btn-icon ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite} title="Add to Favorites">
                <Heart fill={isFavorite ? "#ef4444" : "none"} />
              </button>
              <button className="btn-icon" onClick={handleShare} title="Share">
                <Share2 />
              </button>
            </div>

            <h2 className="info-title">{currentItem.Name}</h2>

            <div className="info-meta">
              <div className="meta-item">
                <span>By {currentItem.Author}</span>
              </div>
              <a href={currentItem.Link} target="_blank" rel="noopener noreferrer" className="meta-item">
                <span>View Original</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <button className="nav-btn nav-right" onClick={handleNext}>
          <ChevronRight size={32} />
        </button>
      </main>

      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
