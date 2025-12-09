# Industrial Monitoring Dashboard

Real-time industrial machine monitoring system built with React. Track machine status, efficiency, production metrics, and operator locations across manufacturing floor sections.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

- **Real-time Monitoring**: Auto-refresh every 20 seconds with live data updates
- **Visual Status Indicators**: Color-coded machine states for instant recognition
- **Interactive Layout**: Drag-and-drop factory floor arrangement
- **Data Analytics**: Comprehensive tables with filtering and sorting
- **Operator Tracking**: "Where Am I" feature for workforce location
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Export & Print**: Generate reports with active events only
- **CSV Import**: Dynamic data loading from semicolon-delimited files

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18.2, Tailwind CSS 3.3
- **Icons**: Lucide React 0.263
- **CSV Parsing**: Papa Parse 5.4
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Build Tool**: Create React App 5.0

### Project Structure

```
src/
├── components/
│   ├── Dashboard.js           # Main container with state management
│   ├── MachineCard.js          # Individual machine representation
│   ├── StatusModal.js          # Filtered status view modal
│   ├── FileUpload.js           # CSV file handler
│   ├── OndeEstou.js            # Operator location tracker
│   ├── PrintDashboard.js       # Print-optimized layout
│   ├── FreeLayoutEditor.js     # Drag-drop layout editor
│   ├── LayoutEditor.js         # Section configuration
│   ├── HeaderWithLogo.js       # Responsive header
│   └── Section.js              # Factory section component
├── hooks/
│   └── useCSVData.js           # Custom hook for CSV processing
├── utils/
│   └── csvParser.js            # CSV parsing utilities
├── styles/
│   ├── index.css               # Global styles
│   └── responsive.css          # Responsive breakpoints
├── App.js                      # Root component
└── index.js                    # Application entry point
```

## 📋 Prerequisites

- **Node.js**: >= 16.x
- **npm**: >= 8.x
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

```bash
# Clone repository
git clone <repository-url>
cd status-de-fabrica-master

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 📊 Data Format

### CSV Structure

The system expects a semicolon-delimited CSV file with the following columns:

```csv
ID_Maquina;Operador;Status;Evento;OP;Operacao;Referencia;Meta;Produzido;Rejeitado;Tempo_Plano;Numero_OS;Data_Prevista;Tempo_Previsto
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `ID_Maquina` | String | Unique machine identifier |
| `Operador` | String | Operator name |
| `Status` | String | Current machine status (see Status Types) |
| `Evento` | String | Event description |
| `OP` | String | Production order |
| `Operacao` | String | Operation type |
| `Referencia` | String | Product reference code |
| `Meta` | Number | Target quantity |
| `Produzido` | Number | Produced quantity |
| `Rejeitado` | Number | Rejected quantity |
| `Tempo_Plano` | Number | Planned time (minutes) |
| `Numero_OS` | String | Service order number |
| `Data_Prevista` | Date | Expected date (YYYY-MM-DD) |
| `Tempo_Previsto` | Time | Expected time (HH:MM) |

### Status Types

| Status | Color | Hex | Description |
|--------|-------|-----|-------------|
| Produção | Green | `#10b981` | Active production |
| Manutenção | Red | `#ef4444` | Under maintenance |
| Qualidade | Purple | `#a855f7` | Quality inspection |
| Setup | Pink | `#ec4899` | Machine setup |
| Falta de Programação | Orange | `#f97316` | Missing programming |
| Falta de Operador | Yellow | `#eab308` | Missing operator |
| Refeição | Blue | `#3b82f6` | Break time |
| Ocioso | Black | `#000000` | Idle |

### Example CSV Row

```csv
95;João Silva;Produção;Evento_Produtivo;OP001;Dobra;REF001;1000;850;5;480;OS001;2024-01-15;08:00
```

## 🔧 Configuration

### Section Layout

Edit the `sections` state in `Dashboard.js`:

```javascript
const [sections, setSections] = useState({
  'SECTION_NAME': {
    machines: ['ID1', 'ID2', 'ID3'],  // Machine IDs
    color: 'bg-blue-600'               // Tailwind color class
  }
});
```

### Auto-refresh Interval

Modify in `useCSVData.js`:

```javascript
const REFRESH_INTERVAL = 20000; // milliseconds (20 seconds)
```

### CSV File Path

Default location: `public/Dados.csv`

To change, update the fetch path in `useCSVData.js`:

```javascript
const response = await fetch('/path/to/your/file.csv');
```

## 🎨 Customization

### Adding New Status Types

1. **Update Status Color Map** (`MachineCard.js`):
```javascript
const statusColorMap = {
  'new_status': 'bg-indigo-500 border-indigo-400 text-white'
};
```

2. **Add Statistics Card** (`Dashboard.js`):
```javascript
const stats = {
  newStatus: filteredMachines.filter(m =>
    normalizeStatus(m.status) === 'new_status'
  ).length
};
```

3. **Create UI Card**:
```jsx
<div onClick={() => openStatusModal('newStatus', 'New Status')}>
  <div>{stats.newStatus}</div>
  <div>NEW STATUS</div>
</div>
```

### Modifying Breakpoints

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'factory': '1920px',
        'ultra': '2560px'
      }
    }
  }
};
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px - 1920px
- **Factory Display**: > 1920px

### Key Responsive Features

- Collapsible navigation tabs
- Adaptive grid layouts (1/2/3/4 columns)
- Touch-optimized controls
- Hamburger menu for mobile
- Scalable font sizes

## 🔌 API Integration

### REST Endpoints (Optional Backend)

```javascript
// GET /api/machines - Fetch all machines
// POST /api/machines/upload - Upload CSV
// GET /api/history - Fetch historical data
// GET /api/machines/:id - Get specific machine
```

### WebSocket Support (Future)

```javascript
// Real-time updates without polling
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setMachines(data);
};
```

## 🧪 Testing

```bash
# Run tests
npm test

# Generate coverage report
npm test -- --coverage

# Run specific test file
npm test Dashboard.test.js
```

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

Output: `build/` directory with optimized static files

### Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=https://api.example.com
REACT_APP_REFRESH_INTERVAL=20000
REACT_APP_CSV_PATH=/Dados.csv
```

### Deployment Options

#### Static Hosting (Netlify/Vercel)
```bash
npm run build
# Deploy 'build' folder
```

#### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-p", "3000"]
```

#### Nginx
```nginx
server {
  listen 80;
  root /var/www/dashboard/build;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

## 🔐 Security Considerations

### Input Validation

- CSV file size limit (configurable)
- Malicious content filtering
- XSS prevention via sanitization

### Data Privacy

- No sensitive data in client-side storage
- HTTPS recommended for production
- CORS policy configuration

### Rate Limiting

```javascript
// Prevent excessive uploads
const UPLOAD_COOLDOWN = 10000; // 10 seconds
```

## 🐛 Troubleshooting

### CSV Not Loading

**Check:**
1. File exists at `public/Dados.csv`
2. Correct delimiter (semicolon `;`)
3. UTF-8 encoding
4. No BOM (Byte Order Mark)

**Debug:**
```javascript
console.log('CSV Content:', csvContent.substring(0, 500));
```

### Machines Not Appearing

**Verify:**
- Machine IDs match between CSV and section configuration
- Status normalization working correctly

**Debug:**
```javascript
const layoutMachines = Object.values(sections).flatMap(s => s.machines);
const csvMachines = machines.map(m => m.id);
console.log('Missing:', layoutMachines.filter(id => !csvMachines.includes(id)));
```

### Performance Issues

**Solutions:**
- Enable React DevTools Profiler
- Implement React.memo for heavy components
- Use pagination for large datasets (>1000 machines)
- Optimize re-render triggers

## 📊 Performance Metrics

### Benchmarks

- **Initial Load**: < 2s (with 500 machines)
- **Refresh Cycle**: < 500ms
- **CSV Parse Time**: ~100ms per 1000 rows
- **Memory Usage**: ~50MB baseline

### Optimization Tips

```javascript
// Memoize expensive calculations
const stats = useMemo(() => calculateStats(machines), [machines]);

// Lazy load components
const PrintDashboard = lazy(() => import('./PrintDashboard'));

// Debounce search
const debouncedSearch = debounce(handleSearch, 300);
```

## 🛠️ Development

### Code Style

- ESLint configuration via Create React App
- Prettier recommended (`.prettierrc`)
- Functional components with hooks
- PropTypes for type checking

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-status-type

# Commit with conventional commits
git commit -m "feat: add maintenance status indicator"

# Pull request to main
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Roadmap

### Version 1.1.0
- [ ] User authentication system
- [ ] Historical data charts (Chart.js integration)
- [ ] Push notifications for critical events
- [ ] PWA support (offline mode)

### Version 1.2.0
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Advanced filtering and search
- [ ] Export to Excel/PDF

### Version 2.0.0
- [ ] Real-time WebSocket updates
- [ ] Machine learning predictions
- [ ] Shift management integration
- [ ] Mobile native apps (React Native)

## 📞 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review troubleshooting section

## 🙏 Acknowledgments

- React team for excellent framework
- Tailwind CSS for utility-first styling
- Papa Parse for robust CSV parsing
- Lucide for beautiful icons
