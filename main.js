/*
  Velrionlabs Landing Page Interactivity & Animations
  Using GSAP (GreenSock Animation Platform) for High-Fidelity Motion Design
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Entrance Animations ---
  // A coordinated, premium onboarding sequence for elements on page load.
  const tlEntrance = gsap.timeline({
    defaults: {
      ease: 'power4.out',
      duration: 1.2
    }
  });

  // Fade and slide down header
  tlEntrance.from('header', {
    y: -30,
    opacity: 0,
    duration: 1
  });

  // Staggered slide up for hero text components
  tlEntrance.from('.live-badge', {
    y: 20,
    opacity: 0,
    scale: 0.9,
    ease: 'back.out(1.5)',
    duration: 0.8
  }, '-=0.6');

  tlEntrance.from('.hero-title', {
    y: 40,
    opacity: 0,
    duration: 1.2
  }, '-=0.6');

  tlEntrance.from('.hero-subtitle', {
    y: 30,
    opacity: 0,
    duration: 1.1
  }, '-=0.9');

  tlEntrance.from('.cta-container', {
    y: 20,
    opacity: 0,
    duration: 1
  }, '-=0.8');

  // Staggered entrance for the floating ad cards (only if screen is desktop)
  if (window.innerWidth > 992) {
    tlEntrance.from('.ad-card', {
      scale: 0.85,
      opacity: 0,
      y: 50,
      rotation: (i) => {
        // Subtle offset rotation on entrance
        const rotations = [-15, 0, 15, 5, 0, 8];
        return rotations[i] || 0;
      },
      stagger: {
        each: 0.12,
        from: "center"
      },
      duration: 1.4,
      ease: 'power3.out',
      onComplete: startFloatingAnimations // Trigger organic float once entrance is done
    }, '-=0.8');
  } else {
    // Mobile/tablet fallback entrance for cards
    tlEntrance.from('.ad-card', {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 1,
      ease: 'power2.out'
    }, '-=0.6');
  }

  // --- 2. Organic Floating / Drifting Animations ---
  // Creates a gentle, continuous drift for the cards in the background.
  function startFloatingAnimations() {
    // We target each card individually with distinct offsets and durations for organic randomness
    const cardsConfig = [
      { id: '#card-1', x: 8, y: 12, r: 2, duration: 7 },
      { id: '#card-2', x: 4, y: 6, r: 0, duration: 5.5 },
      { id: '#card-3', x: 10, y: 10, r: -1.5, duration: 8 },
      { id: '#card-4', x: 6, y: 9, r: -2.5, duration: 7.5 },
      { id: '#card-5', x: 5, y: 7, r: 0, duration: 6 },
      { id: '#card-6', x: 9, y: 11, r: 2, duration: 8.5 }
    ];

    cardsConfig.forEach(config => {
      const card = document.querySelector(config.id);
      if (!card) return;

      // Get initial rotation from style sheet
      const baseRotation = getBaseRotation(config.id);

      // Create a floating timeline for this card
      const floatTimeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: {
          ease: 'sine.inOut',
          duration: config.duration
        }
      });

      // Animate position and rotation
      floatTimeline.to(card, {
        x: `+=${config.x}`,
        y: `-=${config.y}`,
        rotation: baseRotation + config.r
      });

      // Store the timeline reference on the DOM element for access during hover interactions
      card.floatTimeline = floatTimeline;
    });

    // Setup 3D hover interactions
    setup3DHover();
  }

  // Helper to extract base rotation from IDs
  function getBaseRotation(id) {
    const rotations = {
      '#card-1': -7,
      '#card-2': 0,
      '#card-3': 6,
      '#card-4': 3,
      '#card-5': 0,
      '#card-6': 4
    };
    return rotations[id] !== undefined ? rotations[id] : 0;
  }

  // --- 3. Interactive 3D Parallax Tilt Effect ---
  // When user hovers over a card, it responds to their mouse position with a 3D depth effect.
  function setup3DHover() {
    const cards = document.querySelectorAll('.ad-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        // Gently pause the slow drifting animation when hovering
        if (card.floatTimeline) {
          card.floatTimeline.pause();
        }
        
        // Scale and lift the card slightly, setting up 3D perspective
        gsap.to(card, {
          scale: 1.06,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        
        // Get cursor coordinates relative to the card's center
        const mouseX = e.clientX - rect.left - (cardWidth / 2);
        const mouseY = e.clientY - rect.top - (cardHeight / 2);
        
        // Calculate tilt angles (max 12 degrees)
        const tiltX = (mouseY / (cardHeight / 2)) * -8; // Rotates around horizontal axis
        const tiltY = (mouseX / (cardWidth / 2)) * 8;   // Rotates around vertical axis
        
        // Apply 3D rotation and translate the image wrapper for parallax depth
        gsap.to(card, {
          transformPerspective: 800,
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.2,
          ease: 'power1.out'
        });

        const mediaElement = card.querySelector('.card-image-wrapper img, .card-image-wrapper video');
        if (mediaElement) {
          // Slight inverse movement of the media inside to create a parallax effect
          gsap.to(mediaElement, {
            x: (mouseX / (cardWidth / 2)) * -6,
            y: (mouseY / (cardHeight / 2)) * -6,
            duration: 0.2,
            ease: 'power1.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        const baseRotation = getBaseRotation(`#${card.id}`);
        
        // Reset rotation, tilt, and image parallax smoothly
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          rotation: baseRotation,
          scale: 1,
          x: 0, // resets float offsets so drift timeline can resume seamlessly
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            // Resume the slow drifting timeline
            if (card.floatTimeline) {
              card.floatTimeline.resume();
            }
          }
        });

        const mediaElement = card.querySelector('.card-image-wrapper img, .card-image-wrapper video');
        if (mediaElement) {
          gsap.to(mediaElement, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });
    });
  }
});
