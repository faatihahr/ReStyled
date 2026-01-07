# 👗 ReStyled

<div align="center">

![ReStyled Banner](public/images/Restyled.png)

**Your Personal AI Fashion Stylist & Digital Wardrobe**

Transform how you interact with your closet. Never ask "What should I wear?" again.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-re--styled.vercel.app-blueviolet?style=for-the-badge)](https://re-styled.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 🌟 What is ReStyled?

ReStyled is an innovative AI-powered fashion application that revolutionizes your wardrobe experience. We combine computer vision, machine learning, and intelligent algorithms to help you:

- 📸 **Digitize Your Wardrobe** - Snap photos, we'll categorize automatically
- 🎨 **Get Smart Outfit Suggestions** - AI creates combinations you never thought of
- 📊 **Track Your Wear** - See which items you wear most and optimize your closet
- 🌱 **Reduce Fashion Waste** - Make conscious choices by wearing what you own

Say goodbye to outfit dilemmas and hello to endless styling possibilities tailored to your taste, occasion, and lifestyle.

---

## ✨ Key Features

### 🤖 AI-Powered Styling
Intelligent algorithm that learns your style preferences and suggests outfits that match your vibe

### 👔 Digital Wardrobe
Build your virtual closet with automatic categorization and organization of your clothing items

### 🔄 Smart Mix & Match
Create outfit combinations from your existing wardrobe using advanced AI algorithms

### 📈 Wear Analytics
Track which items you wear most frequently and discover forgotten pieces in your collection

### 🎯 Occasion-Based Suggestions
Get outfit recommendations tailored to specific events, weather, and occasions

### ♻️ Sustainability Focus
Reduce fashion waste by maximizing the use of items you already own

---

## 🚀 Tech Stack

ReStyled is built with modern, cutting-edge technologies:

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - Modern state management

### Backend & Database
- **PostgreSQL** - Robust relational database
- **PLpgSQL** - Advanced database functions
- **Next.js API Routes** - Serverless backend

### AI & ML
- **Fashion-MNIST Dataset** - Training data for clothing classification
- **Computer Vision** - Image recognition and analysis
- **Custom ML Models** - Personalized style recommendations

### Deployment & Tools
- **Vercel** - Serverless deployment platform
- **Git** - Version control
- **ESLint** - Code quality assurance

---

## 🎯 How It Works

### 1️⃣ Build Your Digital Closet
```
Snap photos → AI categorizes → Organized wardrobe
```
Upload images of your clothing items, and our AI automatically identifies categories, colors, and styles.

### 2️⃣ Get Personalized Suggestions
```
Your style + AI algorithms → Perfect outfit combos
```
Our intelligent system learns your preferences and creates outfit combinations tailored to you.

### 3️⃣ Track & Optimize
```
Wear tracking → Analytics → Better decisions
```
See which items you wear most and make conscious decisions about your wardrobe.

### 4️⃣ Reduce Waste
```
Maximize existing wardrobe → Less shopping → Sustainable fashion
```
Make the most of what you own before buying new items.

---

## 🛠️ Getting Started

### Prerequisites

```bash
Node.js 18.x or higher
npm, yarn, pnpm, or bun
PostgreSQL database
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/faatihahr/ReStyled.git
cd ReStyled
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure your `.env.local` with:
```env
DATABASE_URL=your_postgresql_url
NEXT_PUBLIC_API_URL=your_api_url
```

4. **Set up the database**
```bash
npm run db:setup
# or use the scripts in /scripts directory
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ReStyled/
├── data/
│   └── fashion-mnist/        # ML training data
├── database/                 # Database schemas and migrations
├── lib/                      # Utility functions and helpers
├── public/                   # Static assets
│   └── images/              # Image resources
├── scripts/                  # Database and setup scripts
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── .gitignore
├── next.config.ts           # Next.js configuration
├── package.json
├── tsconfig.json            # TypeScript configuration
└── README.md
```

---

## 🎨 Key Screens

- **Landing Page** - Introduction to ReStyled's features
- **Digital Wardrobe** - Your organized clothing collection
- **Outfit Builder** - AI-powered mix & match interface
- **Analytics Dashboard** - Wear tracking and insights
- **Profile Settings** - Personalize your style preferences

---

## 🌐 Live Demo

Experience ReStyled in action: **[re-styled.vercel.app](https://re-styled.vercel.app)**

---

## 📊 Database Schema

ReStyled uses PostgreSQL with advanced PLpgSQL functions for:
- User authentication and profiles
- Clothing item storage and categorization
- Outfit combination records
- Wear tracking analytics
- Style preference learning

Check the `/database` directory for complete schema definitions.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? Please open an issue on GitHub with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Faatihah Rahmatillah**

- Portfolio: [fahraaraa.vercel.app](https://fahraaraa.vercel.app/)
- GitHub: [@faatihahr](https://github.com/faatihahr)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Fashion-MNIST dataset for training data
- Next.js team for the amazing framework
- Vercel for hosting and deployment
- The open-source community for inspiration

---

## 🚀 Roadmap

- [ ] Mobile application (iOS & Android)
- [ ] Social sharing features
- [ ] Virtual try-on with AR
- [ ] Shopping integration
- [ ] Collaborative wardrobes
- [ ] Style challenges and community
- [ ] Weather-based outfit suggestions
- [ ] Laundry schedule tracking

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with 💜 by [Faatihah Rahmatillah](https://github.com/faatihahr)

![visitors](https://visitor-badge.laobi.icu/badge?page_id=faatihahr.ReStyled)

---

### Transform Your Wardrobe with AI 🎨✨

</div>
