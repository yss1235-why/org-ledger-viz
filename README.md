# Organization Treasury - Fund Transparency Platform

A modern, transparent fund management platform where members can view treasury balance, transaction history, events, and announcements. Features a secure admin panel for managing all content.

## 🌟 Features

### Public View
- **Real-time Treasury Balance**: Large, prominent display of current funds
- **Transaction History Modal**: Clickable balance reveals complete transaction history
- **Events Management**: View ongoing and upcoming events
- **Announcements**: Stay updated with the latest news
- **Mobile Responsive**: Beautiful design across all devices
- **Indian Rupees Formatting**: Proper ₹ formatting with comma separation

### Admin Panel
- **Secure Google Authentication**: Only whitelisted emails can access
- **Transaction Management**: 
  - Add income transactions with "Received From" field
  - Add expense transactions with expense categories
  - Link transactions to events
  - Auto-updating treasury balance
- **Events Management**: Create and manage ongoing/upcoming events
- **Announcements Management**: Post and manage announcements
- **Real-time Updates**: All changes reflect immediately

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Firebase (Firestore + Authentication)
- **Deployment**: Netlify
- **Currency**: Indian Rupees (₹)

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git
- Netlify account (for deployment)

## 🔧 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Give your project a name

### 2. Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** as a sign-in provider
3. Add your domain to authorized domains (for deployment)

#### Enable Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll add rules next)
4. Choose a location close to your users

#### Set up Firestore Security Rules
1. Go to **Firestore Database** > **Rules**
2. Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow everyone to read
    match /{document=**} {
      allow read: if true;
    }
    
    // Only admin can write
    match /{document=**} {
      allow write: if request.auth != null && 
                      request.auth.token.email in [
                        'your-admin-email@gmail.com'  // Replace with your email
                      ];
    }
  }
}
```

3. Replace `'your-admin-email@gmail.com'` with your actual admin email
4. Click "Publish"

### 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app (give it a name)
5. Copy the `firebaseConfig` object

Your Firebase config is already in `src/config/firebase.ts`.

### 4. Update Admin Email Whitelist

Open `src/config/firebase.ts` and update the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = [
  "your-admin-email@gmail.com", // Replace with your actual email
];
```

⚠️ **Important**: This email must match the email in your Firestore security rules!

## 💻 Local Development

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-project-name>

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### 3. Initialize Database

The first time you access the admin panel and add transactions, the treasury balance will be automatically initialized.

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🌐 Netlify Deployment

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect Vite settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

### Manual Deployment

1. Build your project: `npm run build`
2. Go to [Netlify](https://app.netlify.com/)
3. Drag and drop the `dist` folder

### Configure Redirects

A `public/_redirects` file is already included for proper SPA routing:

```
/*    /index.html   200
```

### Update Firebase Settings

After deployment:

1. Go to Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Add your Netlify domain: `your-app-name.netlify.app`
3. If using custom domain, add that too

## 📱 Usage

### For Members (Public Access)

1. Visit the homepage
2. View current treasury balance
3. Click the balance to see complete transaction history
4. Browse events and announcements

### For Admin

1. Click "Admin" button in header
2. Sign in with Google (must be whitelisted email)
3. Manage transactions, events, and announcements
4. Changes reflect in real-time on public page

### Adding Transactions

**Income Transaction:**
- Select "Income" type
- Enter amount
- Specify "Received From" (person/org name)
- Add description
- Optionally link to an event
- Select date

**Expense Transaction:**
- Select "Expense" type
- Enter amount
- Specify expense category (e.g., "Venue Rent", "Food & Catering")
- Add description
- Optionally link to an event
- Select date

Treasury balance updates automatically!

## 🎨 Customization

### Change Colors

Edit `src/index.css` for design tokens:

```css
:root {
  --primary: 221 83% 53%;  /* Main blue color */
  --secondary: 174 62% 47%; /* Teal accent */
  --income: 142 71% 45%;    /* Green for income */
  --expense: 0 84% 60%;     /* Red for expenses */
}
```

### Organization Name

Edit `src/components/PublicView/Header.tsx`:

```typescript
<h1 className="text-xl font-bold">Your Organization Name</h1>
```

### Footer

Edit `src/pages/Index.tsx` footer section

## 🔒 Security Best Practices

✅ Admin emails whitelisted in both code and Firestore rules  
✅ Client-side validation for all forms  
✅ Server-side security via Firestore rules  
✅ Proper authentication flow  
✅ Read-only public access  

## 📊 Database Structure

### Collections

**treasury** (single document: `current`)
```json
{
  "balance": 50000
}
```

**transactions**
```json
{
  "type": "income" | "expense",
  "amount": 5000,
  "description": "Annual fees",
  "receivedFrom": "John Doe",  // for income
  "expenseCategory": "Venue Rent",  // for expense
  "relatedEvent": "Annual Meeting",
  "date": Timestamp,
  "createdAt": Timestamp
}
```

**events**
```json
{
  "title": "Tech Workshop",
  "description": "Annual workshop",
  "date": Timestamp,
  "status": "ongoing" | "upcoming",
  "createdAt": Timestamp
}
```

**announcements**
```json
{
  "title": "Registration Open",
  "content": "Workshop registration...",
  "date": Timestamp,
  "createdAt": Timestamp
}
```

## 🐛 Troubleshooting

### Can't sign in as admin
- Verify your email is in `ADMIN_EMAILS` array in `src/config/firebase.ts`
- Check Firestore security rules include your email
- Clear browser cache and try again

### Transactions not showing
- Check Firebase Console > Firestore to ensure data exists
- Verify Firestore security rules allow read access
- Check browser console for errors

### Balance not updating
- Ensure admin email is authorized
- Check Firestore security rules allow write access
- Verify `treasury/current` document exists

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run build` again

## 📝 License

MIT License - feel free to use this project for your organization!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using React, Firebase, and Tailwind CSS
