import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 5MB limit" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uploads/forms",
          resource_type: "auto", // Automatically detects if it's an image or raw (pdf)
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during upload" },
      { status: 500 },
    );
  }
}
