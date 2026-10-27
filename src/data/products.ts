export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Audio" | "Workspace" | "Everyday" | "Home";
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  color: string;
  kind: "resale" | "affiliate";
  badge?: string;
  description: string;
  features: string[];
  retailer?: string;
  url?: string;
};

// Illustrative USD catalog. Prices, product specifications, ratings and review
// counts are sample data, not verified offers. Retailer links are untracked
// category/search destinations and must be replaced before commercial launch.
export const products: Product[] = [
  {
    id: "studio-headphones",
    name: "Studio wireless headphones",
    brand: "FORM / AUDIO",
    category: "Audio",
    price: 129,
    originalPrice: 169,
    rating: 4.9,
    reviews: 128,
    image: "/images/hero-headphones.jpg",
    color: "#edece7",
    kind: "resale",
    badge: "Our pick",
    description:
      "A little less noise. A lot more of your favorite music. Meet your everyday over-ear companion, with soft cushions and a beautifully simple silhouette.",
    features: [
      "Over-ear design",
      "Soft, adjustable headband",
      "A comfortable everyday fit",
    ],
  },
  {
    id: "weekender-backpack",
    name: "The everyday backpack",
    brand: "ROAM / EVERYDAY",
    category: "Everyday",
    price: 48,
    originalPrice: 65,
    rating: 4.8,
    reviews: 86,
    image: "/images/backpack.jpg",
    color: "#f0eee7",
    kind: "resale",
    badge: "Good find",
    description:
      "From morning commutes to spontaneous weekends. A thoughtfully sized canvas backpack keeps your daily essentials together, wherever the day takes you.",
    features: [
      "Canvas exterior",
      "Room for daily essentials",
      "Adjustable shoulder straps",
    ],
  },
  {
    id: "pocket-earbuds",
    name: "Pocket wireless earbuds",
    brand: "FORM / AUDIO",
    category: "Audio",
    price: 79,
    rating: 4.7,
    reviews: 92,
    image: "/images/earbuds.jpg",
    color: "#edeeeb",
    kind: "affiliate",
    badge: "Retailer find",
    description:
      "Small enough to take everywhere. Explore wireless earbuds with a compact charging case and an easy, understated design at our featured retailer.",
    features: [
      "Compact carry case",
      "In-ear design",
      "Compare current options at the retailer",
    ],
    retailer: "Amazon",
    url: "https://www.amazon.com/s?k=wireless+earbuds",
  },
  {
    id: "desktop-speaker",
    name: "Room bookshelf speaker",
    brand: "FORM / HOME",
    category: "Home",
    price: 89,
    originalPrice: 119,
    rating: 4.8,
    reviews: 64,
    image: "/images/speaker.jpg",
    color: "#f0eee8",
    kind: "resale",
    badge: "Small upgrade",
    description:
      "Make a little room for better listening. A minimal bookshelf speaker brings a considered finishing touch to your favorite corner.",
    features: [
      "Bookshelf format",
      "Minimal black finish",
      "Made for a listening corner",
    ],
  },
  {
    id: "portable-drive",
    name: "Pocket portable drive",
    brand: "DAILY / WORKSPACE",
    category: "Workspace",
    price: 59,
    originalPrice: 75,
    rating: 4.6,
    reviews: 51,
    image: "/images/portable-drive.jpg",
    color: "#eceeea",
    kind: "resale",
    description:
      "Keep the important things close. This compact external drive is an easy addition to a tidy work setup and a bag that is always ready to go.",
    features: [
      "Compact design",
      "Portable storage format",
      "A simple desk essential",
    ],
  },
  {
    id: "wide-monitor",
    name: "The wide-view monitor",
    brand: "DAILY / WORKSPACE",
    category: "Workspace",
    price: 249,
    rating: 4.7,
    reviews: 73,
    image: "/images/monitor.jpg",
    color: "#edeeeb",
    kind: "affiliate",
    badge: "Retailer find",
    description:
      "Give your ideas a little more space. Explore widescreen monitors for your next desk refresh, and compare available specifications at the retailer.",
    features: [
      "Widescreen format",
      "A cleaner desk setup",
      "Check current specifications at the retailer",
    ],
    retailer: "Best Buy",
    url: "https://www.bestbuy.com/site/searchpage.jsp?st=widescreen+monitor",
  },
  {
    id: "classic-headphones",
    name: "Everyday over-ear headphones",
    brand: "FORM / AUDIO",
    category: "Audio",
    price: 69,
    originalPrice: 89,
    rating: 4.8,
    reviews: 47,
    image: "/images/classic-headphones.jpg",
    color: "#eaece8",
    kind: "resale",
    description:
      "An understated classic for your daily soundtrack. Simple over-ear headphones with soft ear cushions and a comfortable, adjustable fit.",
    features: ["Over-ear cushions", "Adjustable fit", "Classic neutral finish"],
  },
  {
    id: "weekend-sofa",
    name: "The weekend sofa",
    brand: "SLOW / HOME",
    category: "Home",
    price: 699,
    rating: 4.9,
    reviews: 38,
    image: "/images/sofa.jpg",
    color: "#eee9df",
    kind: "affiliate",
    badge: "Retailer find",
    description:
      "A slower Sunday starts here. Explore warm, timeless seating for the room you love spending time in. This image is inspiration; browse current options at the retailer.",
    features: [
      "Warm, natural tones",
      "Timeless living-room inspiration",
      "Confirm materials and dimensions at the retailer",
    ],
    retailer: "IKEA",
    url: "https://www.ikea.com/us/en/cat/sofas-fu003/",
  },
];
