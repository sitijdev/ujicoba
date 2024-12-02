const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { GOOGLE_IMG_SCRAP, GOOGLE_QUERY } = require('google-img-scrap');

// Konfigurasi Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyBpUlpu6Ekn1YSE8aCdhUBKGPEffpop7wc');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log(genAI);

// Fungsi untuk scraping gambar dari Google Images (5 gambar)
async function scrapeImages(keyword) {
  try {
    const result = await GOOGLE_IMG_SCRAP({
      search: keyword,
      excludeDomains: ['istockphoto.com', 'fb.com', 'stablecog.com', 'img.stablecog.com', 'pixabay.com', 'pinimg.com', 'pinterest.com', 'instagram.com', 'facebook.com', 'tiktok.com', 'alamy.com'],
      limit: 5,
      query: {
        SIZE: GOOGLE_QUERY.SIZE.LARGE
      }
    });

    // Ambil URL gambar dari hasil scraping
    const imageUrls = result.result.map(image => image.url);
    return imageUrls;
  } catch (error) {
    console.error("Error saat scraping gambar:", error);
    return [];
  }
}

// Fungsi untuk generate artikel dengan Gemini API
async function generateArticle(keyword) {
  const prompt = `Buat artikel dalam bahasa inggris yang memenuhi kriteria artikel seo sempurna ${keyword}. Artikel harus enak dibaca dan sudah siap tayang tanpa perlu edit lagi. Jangan menulis karakter * (bintang) di artikel.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Generated 1  1  article:', text);
    return text;
  } catch (error) {
    console.error('Error Gemini API:', error);
    throw error;
  }
}

// Fungsi untuk membuat template email
function createEmailContent(keyword, imageUrls, article) {
  let html = `<h1>${keyword}</h1>`;

  // Gambar pertama di depan
  if (imageUrls.length > 0) {
    html += `<img src="${imageUrls[0]}" alt="${keyword}"><br>`;
  }

  html += `<p>${article}</p>`;

  // 4 gambar sisanya di bawah sebagai galeri
  if (imageUrls.length > 1) {
    html += '<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">';
    for (let i = 1; i < imageUrls.length; i++) {
      html += `<img src="${imageUrls[i]}" alt="${keyword}" style="width: 48%; margin-bottom: 10px;">`;
    }
    html += '</div>';
  }

  return html;
}

// Fungsi untuk mengirim email dengan SMTP
async function sendEmail(title, content) {
  const transporter = nodemailer.createTransport({
    host: "mail.tokokeren.web.id",
    port: 465,
    secure: true,
    auth: {
      user: "cs@tokokeren.web.id",
      pass: "BantarCaringin1",
    },
  });

  const mailOptions = {
    from: "cs@tokokeren.web.id",
    to: "sitisolehahbantar@gmail.com",
    subject: title,
    html: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email terkirim:', info.messageId);
  } catch (error) {
    console.error('Gagal mengirim email:', error);
  }
}

// Fungsi utama
async function main() {
  const response = await axios.get(
    'https://raw.githubusercontent.com/fdciabdul/Google-Trends-Keywords-Scraper/main/forcopied/UNITED%20KINGDOM.txt'
  );

  const keywords = response.data.split(',');

  for (const keyword of keywords) {
    if (keyword.trim() !== "") {
      try {
        console.log(`Memproses keyword: ${keyword}`);
        const imageUrls = await scrapeImages(keyword);
        const article = await generateArticle(keyword);
        const content = createEmailContent(keyword, imageUrls, article);
        await sendEmail(keyword, content);
      } catch (error) {
        console.error(`Error memproses keyword ${keyword}:`, error);
      }
    }
  }
}

main();
