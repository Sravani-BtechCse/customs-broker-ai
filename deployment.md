# PortCheck AI — Deployment & Local Run Guide

Customs Broker AI Document Extraction & 3-Way Cross-Check Platform  
**Client:** Company A (Freight Forwarder & Customs Broker, Nhava Sheva Port / INNSA, Navi Mumbai)

---

## 1. Demo Reviewer Credentials

The application includes instantaneous role switching via the top navigation bar with zero password hurdles:

| Role | Demo Identity | Capabilities & Responsibilities |
| :--- | :--- | :--- |
| **Documentation Executive** | Pooja Sharma | Upload documents, inspect AI extracted fields, perform side-by-side verification, confirm low-confidence fields, execute line-item corrections |
| **Documentation Manager** | Kavita Rao | Authorize discrepancy overrides, inspect supplier error profiles & model drift, export final ICEGATE Bill of Entry CSV |

*No registration required — switch roles with one click on the top header bar.*

---

## 2. Step-by-Step Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v22.17.0)
- **npm**: v9.0.0 or higher
- **Git**

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd customs-broker-ai
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   *Note: The platform includes a zero-config deterministic fallback extraction engine so all screens, cross-checks, and exports work immediately without an external API key.*

4. **Run Automated Unit Tests:**
   ```bash
   npm test
   ```
   *Executes test assertions verifying the 45 kg Gross Weight mismatch detection in `SHP-24811`, invoice arithmetic checks, and export blocking gates.*

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 3. Production Deployment (Vercel / Cloud)

The application is architected as a Next.js App Router application optimized for zero-config serverless deployment on Vercel, AWS Amplify, or Render.

### One-Click Deployment via Vercel CLI
```bash
npx vercel
```

### Deployment via GitHub Web Interface
1. Push this repository to your GitHub account as a **public** repository.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repository `customs-broker-ai`.
4. Keep framework preset as **Next.js**.
5. Set Root Directory to `./` and click **Deploy**.

---

## 4. Environment Variables

*Per company assessment guidelines, only variable names are listed. Values and secrets are never committed to version control.*

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini Multimodal Vision API key for dynamic OCR line-item extraction (app operates in high-fidelity offline mode when omitted) |
| `NEXT_PUBLIC_APP_ENV` | Optional | Environment identifier (`development` or `production`) |
| `NEXT_PUBLIC_PORT_CODE` | Optional | Target Indian customs station code (defaults to `INNSA1` for Nhava Sheva) |

---

## 5. Reviewer Quick Walkthrough

1. **Review Pre-Loaded Shipment `SHP-24811`**:
   - Notice the **Weight Mismatch (45 kg)** alert on the dashboard.
   - Click **Review** to open the side-by-side workstation.
   - On the left: Inspect the rendered Commercial Invoice (showing Gross Wt 3,120 kg) vs Packing List (showing 3,165 kg).
   - In the Cross-Check panel: Notice how the export button is **locked** with a security gate.
   - Click **"Accept PL Weight (3,165 kg)"** or provide a **Manager Sign-off** note.
   - Watch the export gate unlock instantly.
   - Click **"Customs Filing CSV"** to generate the real ICEGATE Bill of Entry layout.

2. **Inspect AI Model Uncertainty**:
   - Notice low-confidence fields (e.g. HSN Code `94054090` at 74% confidence) highlighted in amber.
   - Click **Confirm** or use the inline editor to correct it.
   - Click **Audit History** to see the full audit trail of human edits.

3. **Inspect Field & Supplier Accuracy Analytics**:
   - Switch to the **Field & Supplier Accuracy** tab to see model accuracy (96.4%) and error profiles for Chinese vs Swedish suppliers.

4. **Verify ROI Model**:
   - Switch to the **₹70.29L ROI Model** tab to adjust parameters and verify payback calculations against the ₹7.5 Lakh budget.
