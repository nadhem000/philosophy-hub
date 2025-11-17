# Philosophy Learning Hub

A Progressive Web Application (PWA) for learning philosophy with interactive lessons and resources for secondary school students.

## 🌟 Features

- **Progressive Web App**: Installable on any device with offline functionality
- **Multi-language Support**: English, French, and Arabic
- **Dark/Light Theme**: Toggle between themes for comfortable reading
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Curriculum-Based**: Structured lessons for 3rd and 4th year secondary students
- **Offline Access**: Service Worker caches content for offline use

## 📚 Curriculum Coverage

### 3rd Year Secondary
- The Everyday (Propaganda, Prevailing Opinion, Certitude, Illusion)
- Requirements of Thinking (Fallacies, Thinking Procedures, Thinking Ends)
- Experience of Commitment (Autonomy, Ideology, Courage, Responsibility)
- Continuous Study of Philosophical Works

### 4th Year Secondary
- Human between Multiplicity and Unity
- Science between Truth and Modeling
- Values between Relative and Absolute
- Continuous Study of Philosophical Works

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- For development: Node.js (optional)

### Installation

1. **As a Web App**:
   - Visit the deployed site
   - Click the install button in the header (if available)
   - Or use your browser's "Add to Home Screen" feature

2. **Local Development**:
   ```bash
   # Clone the repository
   git clone [repository-url]
   
   # Serve the files using a local server
   # Using Python:
   python -m http.server 8000
   
   # Using Node.js:
   npx serve .
   
   # Using PHP:
   php -S localhost:8000
   ```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Workers, Web App Manifest
- **Styling**: CSS Variables for theming, Flexbox/Grid for layout
- **Storage**: localStorage for preferences
- **Deployment**: Netlify

## 📁 Project Structure

```
philosophy-hub/
├── index.html                 # Main homepage
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker
├── netlify.toml             # Netlify configuration
├── scripts/
│   ├── translation.js       # Language switching
│   └── pwa-handler.js       # PWA installation handling
├── styles/
│   └── main.css             # Main stylesheet
├── assets/
│   └── icons/               # App icons for PWA
└── PhiH-lessons-*.html      # Individual lesson pages
```

## 🌐 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🔧 Configuration

### Service Worker
The service worker (`sw.js`) provides:
- Static asset caching
- Dynamic content caching
- Offline fallback
- Background sync capabilities
- Push notification handling

### Web App Manifest
The manifest (`manifest.json`) defines:
- App name and description
- Icons for different screen sizes
- Theme colors
- Display mode (standalone)

## 📱 PWA Features

- **Installable**: Can be installed on devices
- **Offline Functionality**: Works without internet connection
- **Push Notifications**: Support for content updates
- **App-like Experience**: Fullscreen, standalone display

## 🎨 Theming

The app supports both light and dark themes with a purple-gold color scheme:
- **Primary**: Purple (#6c5ce7)
- **Secondary**: Gold (#fdcb6e)
- **Accent**: Light purple (#a29bfe)

## 🌍 Internationalization

Supported languages:
- **English** (en)
- **French** (fr)
- **Arabic** (ar)

Language preferences are saved in localStorage.

## 📈 Performance

- Service Worker caching for fast loading
- Optimized images and assets
- Minimal JavaScript footprint
- Efficient CSS with variables

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Mejri Ziad**
- Project maintainer and developer

## 🚀 Deployment

The app is configured for deployment on Netlify with:
- SPA redirects for client-side routing
- Security headers
- Cache optimization
- Service Worker support

## 📞 Support

For support and questions:
- Check the lesson content structure
- Verify browser compatibility
- Ensure Service Worker is properly registered

## 🔄 Updates

- Content updates are managed through the Service Worker
- New versions trigger update notifications
- Background sync for content synchronization

---

**Philosophy Learning Hub** - Making philosophical education accessible to everyone, everywhere.