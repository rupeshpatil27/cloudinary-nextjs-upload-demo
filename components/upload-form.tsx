"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, X, File as FileIcon, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const formSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "Please select a file.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .png, .webp, and .pdf formats are supported."
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ url: string; public_id: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  // Handle Drag & Drop Logic
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    
    form.setValue("file", file, { shouldValidate: true });
    
    // Generate preview
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0]);
      }
    },
    [form]
  );

  const clearFile = () => {
    form.setValue("file", undefined as unknown as File, { shouldValidate: true });
    setPreview(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: FormValues) => {
    setUploadResult(null);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", data.file);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok && result.success) {
        setUploadResult({ url: result.url, public_id: result.public_id });
        form.reset({ title: "", description: "" });
      } else {
        form.setError("root", { message: result.error || "Upload failed" });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      form.setError("root", { message: "Network error occurred" });
    }
  };

  const selectedFile = form.watch("file");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>File Attachment</FormLabel>
                  <FormControl>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                      />

                      {!selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="w-10 h-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">SVG, PNG, JPG or PDF (max. 5MB)</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-2 bg-background rounded-md shadow-sm border z-10 relative">
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <FileIcon className="w-12 h-12 text-blue-500 p-2 bg-blue-50 rounded" />
                          )}
                          <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              clearFile();
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSubmitting && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {form.formState.errors.root && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

            {uploadResult && (
              <div className="p-4 bg-green-50 text-green-800 rounded-md flex items-start gap-3 border border-green-200">
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Upload Successful!</h4>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 hover:underline break-all"
                  >
                    View uploaded file
                  </a>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedFile}>
              {isSubmitting ? "Uploading..." : "Submit File"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}