# Next.js & Cloudinary: File Upload System

A robust, full-stack file upload solution built with the Next.js App Router, React Hook Form, and Cloudinary.

This project demonstrates a secure, production-grade approach to handling user file uploads, featuring a custom drag-and-drop interface, strict dual-layer validation (client and server), and direct-to-cloud buffer streaming.

## 🚀 Features

- **Custom Drag-and-Drop UI**: A polished upload zone built with standard HTML flow, enhanced by shadcn/ui and TailwindCSS.
- **Dual-Layer Validation**:
  - Strict file type checking (JPG, PNG, WEBP, PDF).
  - 5MB file size limit enforced on both the frontend and backend.
- **Optimized Upload Flow**: Files are converted to buffers and streamed directly to Cloudinary via the Next.js API route, preventing server memory exhaustion.
- **Enhanced UX**:
  - Real-time image previews (and PDF icons).
  - Simulated upload progress indicator.
  - Form loading states with disabled buttons to prevent double-submissions.
  - Graceful success and error handling.
- **Security First**: Cloudinary credentials never leave the server. The frontend only receives the final public URL.

## 🛠 Tech Stack

**Frontend:**

- Next.js 16+ (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form & Zod (Validation)

**Backend:**

- Next.js Route Handlers (`/api/upload`)
- Cloudinary Node.js SDK

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add your Cloudinary credentials. You can find these in your Cloudinary console dashboard:

```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```
