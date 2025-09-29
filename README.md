# ChargeFinder ⚡

**Find the cheapest EV charging stations near you across America**

ChargeFinder is a comprehensive web application that aggregates data from multiple EV charging networks to help you find the most cost-effective charging stations for your electric vehicle. Whether you're planning a road trip or just need a quick charge, ChargeFinder compares prices and amenities across all major charging providers.

## 🚗 Features

- **Multi-Network Support**: Aggregates data from Tesla Superchargers, ChargePoint, EVgo, Electrify America, Volta, and more
- **Smart Price Comparison**: Calculates estimated charging costs based on your specific EV model
- **Interactive Map**: Visualize charging stations with real-time availability
- **Advanced Filtering**: Filter by distance, connector types, power levels, amenities, and price
- **EV Model Selection**: Choose from popular EV models with accurate charging specifications
- **Location Services**: Use GPS or enter your address manually
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with OpenStreetMap
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chargefinder.git
cd chargefinder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### API Keys

To enable full functionality, you'll need to obtain API keys from the following services:

1. **OpenCage Geocoding API** (for address geocoding):
   - Sign up at [OpenCage](https://opencagedata.com/)
   - Replace `YOUR_API_KEY` in `src/components/LocationSelector.tsx`

2. **EV Charging APIs** (for real-time data):
   - Tesla API
   - ChargePoint API
   - EVgo API
   - Electrify America API
   - Open Charge Map API

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key
NEXT_PUBLIC_TESLA_API_KEY=your_tesla_api_key
NEXT_PUBLIC_CHARGEPOINT_API_KEY=your_chargepoint_api_key
# Add other API keys as needed
```

## 📱 Usage

1. **Select Your EV**: Choose your electric vehicle model from the dropdown
2. **Set Location**: Use GPS or enter your address manually
3. **Apply Filters**: Customize search by distance, power, amenities, and price
4. **Search**: Click "Find Charging Stations" to see results
5. **View Results**: Switch between map and list views
6. **Compare**: Review pricing, amenities, and availability

## 🗺️ Supported EV Models

- Tesla Model 3, Y, S, X
- Chevrolet Bolt EV
- Ford Mustang Mach-E
- BMW i3
- Audi e-tron
- Nissan Leaf
- Hyundai Kona Electric
- Kia Soul EV
- Volkswagen ID.4
- And more...

## 🔌 Supported Connector Types

- Tesla Supercharger
- CCS1/CCS2 (Combined Charging System)
- CHAdeMO
- Type 1/Type 2 (J1772)
- Tesla Destination Charger

## 🏪 Supported Charging Networks

- Tesla Supercharger Network
- ChargePoint
- EVgo
- Electrify America
- Volta Charging
- Blink Charging
- SemaConnect
- And more...

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- All EV charging networks for providing APIs
- The EV community for feedback and suggestions

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/chargefinder/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🔮 Roadmap

- [ ] Real-time availability updates
- [ ] Route planning with charging stops
- [ ] User accounts and favorites
- [ ] Mobile app (React Native)
- [ ] Integration with more charging networks
- [ ] Cost savings calculator
- [ ] Community reviews and ratings

---

**Made with ⚡ for the EV community**