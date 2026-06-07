/**
 * Helper to get the correct character image path based on character name.
 * Handles mixed extensions (.jpg, .webp, .png) and shorter names.
 */
export const getCharacterImage = (name) => {
  if (!name) return '';
  const mapping = {
    "Monkey D. Luffy": "luffy.png",
    "Mr. Bean": "mrbean.webp",
    "Sherlock Holmes": "sherlock.jpg",
    "Light Yagami": "light.png",
    "Batman": "batman.jpg",
    "Tyrion Lannister": "tyrion.webp",
    "Walter White": "walter.webp",
    "Harry Potter": "harry.webp"
  };

  // Find exact or case-insensitive match
  const key = Object.keys(mapping).find(
    k => k.toLowerCase() === name.toLowerCase()
  );
  
  if (key) {
    return `/images/${mapping[key]}`;
  }

  // Fallback default format
  const cleanName = name.toLowerCase().replace(/[\s.]/g, '');
  return `/images/${cleanName}.png`;
};
