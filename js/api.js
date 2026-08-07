/**
 * Database & API Simulation Layer
 * Bloom & Blossom Flower Shop System
 */

const INITIAL_FLOWERS = [
  {
    id: 1,
    name: "Classic Red Rose Bouquet",
    category: "rose",
    price: 34.99,
    rating: 4.9,
    image: "assets/images/dark_red_roses.jpg",
    description: "Hand-picked velvet red roses arranged in an elegant satin wrap. The ultimate expression of romance.",
    inStock: true
  },
  {
    id: 2,
    name: "Pure Stargazer Pink Lily",
    category: "lily",
    price: 29.50,
    rating: 4.8,
    image: "assets/images/red_lily_stem.jpg",
    description: "Fragrant soft pink lilies blended with delicate foliage. Brightens any room instantly.",
    inStock: true
  },
  {
    id: 3,
    name: "Royal Purple Baby's Breath",
    category: "gypsophila",
    price: 42.00,
    rating: 5.0,
    image: "assets/images/purple_baby_breath.jpg",
    description: "Exotic and long-lasting gypsophila in vibrant purple cloud hues.",
    inStock: true
  },
  {
    id: 4,
    name: "Crimson Spider Lily Stem",
    category: "lily",
    price: 38.00,
    rating: 4.9,
    image: "assets/images/red_spider_lily.jpg",
    description: "Vibrant red spider lily stems casting delicate aesthetic shadows.",
    inStock: true
  },
  {
    id: 5,
    name: "Blushing Pink Parrot Tulip",
    category: "tulip",
    price: 36.50,
    rating: 4.8,
    image: "assets/images/pink_tulip_stem.jpg",
    description: "Elegant open-petal pink parrot tulips with fine art studio aesthetic.",
    inStock: true
  },
  {
    id: 6,
    name: "Pristine White Iris Bloom",
    category: "iris",
    price: 40.00,
    rating: 5.0,
    image: "assets/images/white_iris_stem.jpg",
    description: "Architectural white irises in bloom with pure elegance and gold centers.",
    inStock: true
  }
];

// Initialize local database if empty
if (!localStorage.getItem('flowers_db')) {
  localStorage.setItem('flowers_db', JSON.stringify(INITIAL_FLOWERS));
}

export const FlowerAPI = {
  // Fetch all flowers
  getFlowers: async function() {
    return JSON.parse(localStorage.getItem('flowers_db')) || INITIAL_FLOWERS;
  },

  // Get flower by ID
  getFlowerById: async function(id) {
    const flowers = await this.getFlowers();
    return flowers.find(f => f.id === parseInt(id));
  },

  // Get filtered flowers
  filterFlowers: async function(category = 'all', searchQuery = '') {
    let flowers = await this.getFlowers();
    
    if (category !== 'all') {
      flowers = flowers.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      flowers = flowers.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }

    return flowers;
  }
};
