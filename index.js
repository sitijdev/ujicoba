const { GOOGLE_IMG_SCRAP, GOOGLE_QUERY } = require('google-img-scrap');

async function scrapeImages() {
  try {
    const result = await GOOGLE_IMG_SCRAP({
      search: 'gadis cantik',
      excludeDomains: ['istockphoto.com', 'fb.com', 'stablecog.com', 'img.stablecog.com', 'pixabay.com', 'pinimg.com', 'pinterest.com', 'instagram.com', 'facebook.com', 'tiktok.com', 'alamy.com'],
      limit: 5,
      query: { // Pastikan menggunakan tanda kurung kurawal
        SIZE: GOOGLE_QUERY.SIZE.LARGE
      }
    });

    console.log(result);

  } catch (error) {
    console.error("Error:", error);
  }
}

scrapeImages();
