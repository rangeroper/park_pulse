# 🦌 YellowstoneWatch - 3D Wildlife Tracking System

> *A passion project born from countless hours exploring Yellowstone's wilderness and a deep commitment to wildlife conservation.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Overview

As an aspiring park ranger with an unwavering love for Yellowstone National Park, I've spent countless dawn hours tracking grizzlies through Lamar Valley and documenting wolf pack movements across Hayden Valley. This project represents the intersection of my passion for wildlife conservation and modern web technology.

YellowstoneWatch is a comprehensive 3D wildlife tracking system designed specifically for America's first national park. Built with cutting-edge web technologies, it provides real-time wildlife monitoring, interactive 3D mapping, and collaborative reporting tools for rangers, researchers, and wildlife enthusiasts.

## 🎯 Mission Statement

*"To bridge the gap between traditional wildlife tracking methods and modern technology, creating a platform that enhances conservation efforts while making wildlife data accessible to the next generation of park rangers and conservationists."*

## ✨ Key Features

### 🗺️ **Advanced 3D Mapping System**
- **Isometric 3D Visualization**: Custom-built 3D map rendering with realistic terrain representation
- **Multi-Layer Support**: Toggle between terrain, land cover, elevation contours, and thermal features
- **Interactive Landmarks**: Detailed information on geysers, hot springs, and geological features
- **Real-time Coordinate System**: Precise GPS tracking with 6-decimal precision

### 🐻 **Wildlife Tracking & Monitoring**
- **Species-Specific Markers**: Distinct visual indicators for bears, wolves, bison, elk, eagles, and rare species
- **Threat Level Assessment**: Color-coded system (🟢 Low, 🟡 Medium, 🔴 High) with real-time alerts
- **Behavioral Documentation**: Comprehensive description fields for wildlife behavior patterns
- **Verification System**: Ranger-verified sightings with accuracy tracking

### 📊 **Data Analytics & Insights**
- **Heatmap Visualization**: Wildlife activity density mapping with adjustable intensity
- **Statistical Dashboard**: Real-time metrics on sightings, threats, and species distribution
- **Temporal Analysis**: Time-based filtering and historical data visualization
- **Export Capabilities**: JSON data export for research and reporting

### 👥 **Collaborative Platform**
- **Multi-User System**: Role-based access for rangers, researchers, and volunteers
- **User Profiles**: Detailed contributor profiles with verification status and accuracy ratings
- **Real-time Updates**: Live data synchronization across all connected devices
- **Social Features**: User interaction and sighting validation

### 🔍 **Advanced Search & Filtering**
- **Multi-Parameter Search**: Filter by species, threat level, date range, and location
- **Geographic Boundaries**: Yellowstone-specific coordinate validation
- **Smart Suggestions**: Auto-complete for species names and locations
- **Saved Searches**: Bookmark frequently used filter combinations

## 📱 Usage Guide

### **Reporting a Wildlife Sighting**
1. Click the "Report Sighting" button
2. Select wildlife type and specific species
3. Use GPS or map selection for precise location
4. Add detailed behavioral description
5. Set appropriate threat level
6. Submit for verification

### **Exploring the 3D Map**
- **Pan**: Click and drag to move around the map
- **Zoom**: Use zoom controls or mouse wheel
- **Layers**: Toggle different map layers via the layer panel
- **Markers**: Click on wildlife markers for detailed information

### **Data Analysis**
- Use the search and filter tools in the sidebar
- Export data for external analysis
- View user profiles and verification statistics
- Monitor real-time threat alerts

## 🎨 Design Philosophy

### **Visual Design Principles**
- **Nature-Inspired Color Palette**: Earth tones reflecting Yellowstone's natural beauty
- **Intuitive Iconography**: Species-specific emojis and clear visual hierarchy
- **Accessibility First**: High contrast ratios and screen reader compatibility
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile

### **User Experience Focus**
- **Ranger-Centric Workflow**: Designed for field use with minimal interaction steps
- **Real-time Feedback**: Immediate visual confirmation of all user actions
- **Offline Capability**: Local storage for areas with limited connectivity
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🔬 Technical Deep Dive

### **3D Rendering System**
The custom 3D mapping engine uses pure CSS transforms to create an isometric view of Yellowstone. This approach provides:
- **Performance**: No WebGL overhead, runs smoothly on all devices
- **Accessibility**: Screen readers can still interpret the content
- **Maintainability**: Standard CSS properties, no complex 3D libraries

### **Coordinate System**
\`\`\`typescript
// Yellowstone National Park Boundaries
const YELLOWSTONE_BOUNDS = {
  north: 45.1,    // Northern boundary
  south: 44.1,    // Southern boundary  
  east: -109.9,   // Eastern boundary
  west: -111.2,   // Western boundary
  center: { lat: 44.6, lng: -110.5 }
};

// Coordinate validation
const isWithinYellowstone = (coords: Coordinates): boolean => {
  return coords.lat >= 44.1 && coords.lat <= 45.1 &&
         coords.lng >= -111.2 && coords.lng <= -109.9;
};
\`\`\`

### **Data Persistence Strategy**
- **File-based Storage**: JSON files for simplicity and portability
- **Atomic Operations**: Ensures data integrity during concurrent access
- **Backup Strategy**: Automatic data validation and recovery
- **Migration Path**: Easy transition to database systems as needed

### **Wildlife Data**
- Report accurate sightings with detailed descriptions
- Verify existing sightings based on your field experience
- Share behavioral observations and habitat notes

### **Feature Requests**
- GPS track recording for wildlife movement patterns
- Weather integration for behavioral correlation
- Mobile app development for field use
- Integration with existing park ranger systems

### **Project Links**
- **Live Demo**: [https://parkpulse-kou90e0vs-brmochel92s-projects.vercel.app/](https://parkpulse-kou90e0vs-brmochel92s-projects.vercel.app/)
- **Documentation**: [Project Wiki](https://github.com/rangeroper/park_pulse)
- **Issue Tracker**: [GitHub Issues](https://github.com/rangeroper/park_pulse/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yellowstone National Park Service** - For inspiring a lifelong passion for wildlife conservation
- **The Greater Yellowstone Ecosystem** - The incredible wildlife that makes this work meaningful
- **Open Source Community** - For the amazing tools and libraries that make this project possible
- **Fellow Rangers & Wildlife Enthusiasts** - For sharing knowledge and field experience

---

*Built with ❤️ for wildlife conservation and the future of our national parks.*

**"In every walk with nature, one receives far more than they seek."** - John Muir
