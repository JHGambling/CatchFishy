export const images = {};

export function loadAssets() {
  const assetsToLoad = {
    fish: ['fish1.png', 'fish2.png', 'fish3.png', 'fish4.png', 'fish5.png'],
    plants: ['plant1.png', 'plant2.png'],
    seabed: ['seabed.png'],
    bubbles: ['bubble.png'],
    gems: ['gem1.png', 'gem2.png', 'gem3.png']
  };

  const basePaths = {
    fish: 'images/fish/',
    plants: 'images/background/',
    seabed: 'images/background/',
    bubbles: 'images/background/',
    gems: 'images/bonus/'
  };

  const promises = [];

  for (const [key, files] of Object.entries(assetsToLoad)) {
    images[key] = [];
    files.forEach(file => {
      const img = new Image();
      img.src = basePaths[key] + file;
      images[key].push(img);
      promises.push(new Promise(resolve => img.onload = resolve));
    });
  }

  return Promise.all(promises);
}
