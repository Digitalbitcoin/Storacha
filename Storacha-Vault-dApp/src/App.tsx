import React from 'react';
import { IconButton, Theme } from '@radix-ui/themes';
import { useEffect, useState } from "react";
import { Dashboard } from './components/Dashboard';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import '@radix-ui/themes/styles.css';

function App() {
  const [isDarkTheme, setIsDarkTheme] = React.useState(true);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Theme
      appearance={isDarkTheme ? 'dark' : 'light'}
      accentColor="red"
      grayColor="mauve"
      radius="small"
      scaling="100%"
    >
      {/* Back to Top Button */}
      {showButton && (
        <IconButton
          onClick={scrollToTop}
          size="2"
          variant="soft"
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 1000,
            borderRadius: '50%',
            border: '1px solid var(--accent-4)',
            boxShadow: '0 2px 10px var(--black-a5)',
            opacity: 0.9,
            transition: 'opacity 0.3s ease'
          }}
        >
          <ArrowUpIcon width="18" height="18" />
        </IconButton>
      )}
      
      <Dashboard 
        isDarkTheme={isDarkTheme}
        onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
      />
    </Theme>
  );
}

export default App;