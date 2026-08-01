// Fallback local products database in case Supabase is not yet configured or tables are empty
const LOCAL_PRODUCTS = [
  {
    id: 1,
    name: "Combo Lip",
    price: 8.00,
    description: "El trío perfecto para tus labios. Incluye un delineador de labios, un labial en barra para dar color y un gloss para un acabado con brillo espectacular.",
    mediaType: "image",
    src: "./assets/productos/combo_lip.jpeg"
  },
  {
    id: 2,
    name: "Corrector Aoa",
    price: 6.00,
    description: "Cobertura perfecta con acabado natural. Ideal para corregir e iluminar tu mirada sin dejar una textura pesada.",
    mediaType: "image",
    src: "./assets/productos/corrector_aoa_tono_m1.jpeg"
  },
  {
    id: 3,
    name: "Gloss Dolce Bella",
    price: 4.50,
    description: "Brillo labial ultra brillante que proporciona hidratación y volumen. Fórmula no pegajosa enriquecida con aceites naturales para una sensación confortable.",
    mediaType: "image",
    src: "./assets/productos/gloss_dolce_bella.jpeg"
  },
  {
    id: 4,
    name: "Gloss Sheglam",
    price: 4.00,
    description: "El toque perfecto de brillo húmedo y suavidad. Dale volumen a tus labios sin dejar sensación pegajosa.",
    mediaType: "image",
    src: "./assets/productos/gloss_sheglam.jpeg"
  },
  {
    id: 5,
    name: "Lápiz Labial",
    price: 2.00,
    description: "Lápiz perfilador de textura cremosa y fácil deslizamiento. Define el contorno de tus labios con alta precisión y ayuda a prolongar la duración de tu labial..",
    mediaType: "image",
    src: "./assets/productos/lapiz_labial.jpeg"
  },
  {
    id: 6,
    name: "Máscara Fat Lash",
    price: 6.10,
    description: "Volumen impactante y longitud al máximo. Levanta y define tus pestañas desde la raíz con una fórmula de larga duración.",
    mediaType: "image",
    src: "./assets/productos/mascara_fat_lash.jpeg"
  },
  {
    id: 7,
    name: "Blush Muxi Beauty",
    price: 4.00,
    description: "Rubor en crema de textura suave y fácil difuminado. Aporta un color natural y jugoso a tus mejillas con un acabado fresco que dura todo el día.",
    mediaType: "image",
    src: "./assets/productos/muxi_beauty.jpeg"
  },
  {
    id: 8,
    name: "Pega de Pestañas Aoa",
    price: 6.10,
    description: "Fijación extrema y secado rápido en segundos. La pega perfecta para mantener tus pestañas postizas intactas y seguras durante todo el día.",
    mediaType: "image",
    src: "./assets/productos/pega_pestanas.jpeg"
  },
  {
    id: 9,
    name: "Polvo Bakery",
    price: 8.00,
    description: "Sella tu base y dile adiós al brillo. Un polvo translúcido de alta calidad que matifica tu rostro y prolonga la duración de tu look por horas.",
    mediaType: "image",
    src: "./assets/productos/polvo_bakery.jpeg"
  },
  {
    id: 10,
    name: "Polvo Sheglam",
    price: 4.00,
    description: "Polvo suelto fijador de textura ultra ligera. Sella tu maquillaje por horas, dejando un acabado sedoso y una luminosidad sutil y natural en la piel.",
    mediaType: "image",
    src: "./assets/productos/polvo_sheglam.jpeg"
  },
  {
    id: 11,
    name: "Polvo Raquel Tono Banana",
    price: 13.00,
    description: "Polvo suelto mineral en tono banana. Su partícula ultra fina corrige el subtono de la piel, ilumina las zonas altas del rostro y ofrece una alta resistencia.",
    mediaType: "image",
    src: "./assets/productos/polvo_banana_raquel.jpeg"
  },
  {
    id: 12,
    name: "Polvo Aoa Translúcido",
    price: 5.50,
    description: "Polvo suelto translúcido de alta definición. Sella tu maquillaje de forma ligera sin aportar peso, alterarse el tono ni dejar un efecto acartonado.",
    mediaType: "image",
    src: "./assets/productos/polvo_translucido_aoa.jpeg"
  },
  {
    id: 13,
    name: "Protector Solar Vichy",
    price: 6.00,
    description: "Protector solar facial de amplio espectro SPF 50. Textura ultra ligera de rápida absorción con efecto toque seco, ideal para usar antes del maquillaje.",
    mediaType: "image",
    src: "./assets/productos/protector_solar.jpeg"
  },
  {
    id: 14,
    name: "Rímel Aoa Length",
    price: 6.10,
    description: "Diseñada exclusivamente para alargar tus pestañas al máximo. Su cepillo de precisión atrapa cada vello desde la raíz, estirándolo sin dejar grumos.",
    mediaType: "image",
    src: "./assets/productos/rimel_pestanas.jpeg"
  }
];

// Active products array
let PRODUCTS = [];

// Initialize products from Supabase
async function initializeProductsDatabase() {
  const db = typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null;
  
  if (!db) {
    console.log("Supabase not configured or client load failed. Using local database.");
    PRODUCTS = LOCAL_PRODUCTS;
    return PRODUCTS;
  }

  try {
    // Select products along with category name from joint table relation
    const { data, error } = await db.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("Supabase products table is empty. Using local fallback database.");
      PRODUCTS = LOCAL_PRODUCTS;
      return PRODUCTS;
    }

    // Map database structures to fit local catalog fields
    PRODUCTS = data.map(item => ({
      id: Number(item.id),
      name: item.name,
      price: Number(item.price),
      description: item.description,
      mediaType: "image",
      src: item.image_url,
      category: item.categories ? item.categories.name : "all"
    }));

    console.log("Loaded products dynamically from Supabase DB:", PRODUCTS.length);
    return PRODUCTS;
  } catch (err) {
    console.warn("Failed to fetch from Supabase. Falling back to local database. Error:", err.message);
    PRODUCTS = LOCAL_PRODUCTS;
    return PRODUCTS;
  }
}

// Attach to window
window.initializeProductsDatabase = initializeProductsDatabase;
window.PRODUCTS = PRODUCTS;
