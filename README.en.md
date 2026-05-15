# Couple Task - Couple Task Management App

[![License](https://img.shields.io/github/license/partialy/couple-task)](https://gitee.com/partialy/couple-task)

Couple Task is a comprehensive solution designed for couples, enabling collaborative task management, reward incentives, daily check-ins, and emotional journaling. It includes both a user-facing application and an admin backend, supporting features such as point redemption, a digital item shop, real-time chat, and check-in achievements.

## Technology Stack

### User Frontend
- **Frontend Framework**: React + TypeScript + Vite
- **State Management**: Zustand
- **Routing**: React Router
- **UI Components**: Custom component library
- **Real-time Communication**: WebSocket

### Admin Backend Frontend
- **Frontend Framework**: React + TypeScript + Vite
- **UI Library**: Based on Radix UI
- **HTTP Client**: Axios

### Backend Services
- **Framework**: Spring Boot 3.x
- **Database**: MySQL + MyBatis Plus
- **Authentication**: JWT
- **Real-time Communication**: WebSocket
- **File Storage**: Qiniu Cloud Object Storage

## Core Features

### Task System
- Create, publish, accept, and complete tasks
- Task rewards (points, items, commemorative coins)
- Task comments and interactions
- Task template library

### Points & Shop
- History of point acquisition and consumption
- Redemption of items from the points store
- Exchange of commemorative coins for special rewards
- User item inventory management

### Check-ins & Achievements
- Periodic check-in plans (daily/weekly/monthly)
- Check-in calendar with streak rewards
- Achievement system with badges and titles

### Diary & Anniversaries
- Collaborative couple diary writing and interaction
- Anniversary management (birthdays, anniversaries, etc.)
- Mood logging

### Time Machine
- Wishlist creation and tracking
- Photo album updates
- Moment collections

### Real-time Communication
- Real-time chat (WebSocket)
- Online status awareness
- System notification pushes

### Admin Backend
- User management
- Task moderation and approval
- Shop and item management
- Content governance
- Operational data dashboard
- Feedback ticket handling

## Quick Start

### Prerequisites

- Node.js >= 18
- JDK 17+
- MySQL 8.0+
- Maven 3.8+

### Configuration

1. Copy and modify configuration files, including database connection settings:

```bash
# User frontend
cp .env.example .env

# Backend
cp server-java/src/main/resources/application.yml.example server-java/src/main/resources/application.yml
```

2. Execute database initialization scripts:

```bash
# Create database
mysql -u root -
```