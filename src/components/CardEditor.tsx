"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";

type ButtonItem = { label: string; url: string };
type CardData = {
  id?: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  buttons: ButtonItem[];
  isActive: boolean;
};

type CardEditorProps = {
  initialData?: CardData;
  onSave: (data: CardData) => Promise<void>;
  onCancel?: () => void;
};

export function CardEditor({ initialData, onSave, onCancel }: CardEditorProps) {
  const [name, setName] = useState(initialData?.name || "کارت جدید");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [buttons, setButtons] = useState<ButtonItem[]>(initialData?.buttons || [{ label: "", url: "" }]);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error || "خطا در آپلود فایل");
        return;
      }

      setImageUrl(json.url);
      setMessage("✅ فایل با موفقیت آپلود شد");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("خطا در آپلود فایل");
    } finally {
      setUploading(false);
    }
  };

  const updateButton = (index: number, patch: Partial<ButtonItem>) => {
    setButtons((old) => old.map((btn, i) => (i === index ? { ...btn, ...patch } : btn)));
  };

  const removeButton = (index: number) => {
    setButtons((old) => old.filter((_, i) => i !== index));
  };

  const addButton = () => {
    if (buttons.length < 6) {
      setButtons((old) => [...old, { label: "", url: "" }]);
    }
  };

  const handleSave = async () => {
    setMessage("");
    
    if (!title.trim()) {
      setMessage("عنوان کارت الزامی است");
      return;
    }

    setSaving(true);
    try {
      const cleanButtons = buttons.filter((btn) => btn.label.trim() && btn.url.trim());
      await onSave({
        id: initialData?.id,
        name,
        title,
        description,
        imageUrl,
        price,
        buttons: cleanButtons,
        isActive,
      });
    } catch (error) {
      setMessage((error as Error).message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* عنوان */}
      <div>
        <label className="block text-right text-[11px] font-black text-[#24123F]">
          عنوان کارت *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="منوی شانشین"
          className="mt-1 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none focus:border-[#5B2BE2]"
        />
      </div>

      {/* نام داخلی */}
      <div>
        <label className="block text-right text-[11px] font-black text-[#6D6780]">
          نام داخلی (اختیاری)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="کارت منوی اصلی"
          className="mt-1 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[12px] font-bold outline-none"
        />
      </div>

      {/* توضیحات */}
      <div>
        <label className="block text-right text-[11px] font-black text-[#24123F]">
          توضیحات
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="برای مشاهده منوی کامل و رزرو از دکمه‌های زیر استفاده کنید."
          className="mt-1 min-h-[80px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold outline-none focus:border-[#5B2BE2]"
        />
      </div>

      {/* عکس */}
      <div>
        <label className="block text-right text-[11px] font-black text-[#24123F]">
          عکس کارت
        </label>
        <div className="mt-1 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F2EEFF] text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال آپلود...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                انتخاب و آپلود عکس
              </>
            )}
          </button>
          
          {imageUrl && (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={imageUrl} alt="preview" className="h-40 w-full object-cover" />
              <button
                onClick={() => setImageUrl("")}
                className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* قیمت */}
      <div>
        <label className="block text-right text-[11px] font-black text-[#6D6780]">
          قیمت (اختیاری)
        </label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="100,000 تومان"
          className="mt-1 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none"
        />
      </div>

      {/* دکمه‌ها */}
      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addButton}
            disabled={buttons.length >= 6}
            className="flex h-9 items-center gap-1 rounded-xl bg-[#F2EEFF] px-3 text-[11px] font-black text-[#5B2BE2] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            افزودن دکمه
          </button>
          <label className="text-[11px] font-black text-[#24123F]">دکمه‌ها</label>
        </div>
        <div className="mt-2 space-y-2">
          {buttons.map((button, index) => (
            <div key={index} className="rounded-2xl bg-[#FBFAFF] p-2 ring-1 ring-[#ECE8F6]">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => removeButton(index)}
                  className="grid h-7 w-7 place-items-center rounded-xl bg-red-50 text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-black text-[#5B2BE2]">دکمه {index + 1}</span>
              </div>
              <input
                value={button.label}
                onChange={(e) => updateButton(index, { label: e.target.value })}
                placeholder="عنوان دکمه"
                className="h-10 w-full rounded-xl border border-[#ECE8F6] bg-white px-2 text-right text-[11px] font-bold outline-none"
              />
              <input
                value={button.url}
                onChange={(e) => updateButton(index, { url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
                className="mt-2 h-10 w-full rounded-xl border border-[#ECE8F6] bg-white px-2 text-left text-[11px] font-bold outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* فعال/غیرفعال */}
      <label className="flex items-center justify-between rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 accent-[#5B2BE2]"
        />
        کارت فعال باشد
      </label>

      {/* پیام */}
      {message && (
        <p className={`rounded-2xl p-2 text-right text-[11px] font-bold ${message.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
          {message}
        </p>
      )}

      {/* دکمه‌های عمل */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-[20px] bg-gray-100 text-[13px] font-black text-gray-700"
          >
            انصراف
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[13px] font-black text-white disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>ذخیره کارت</>
          )}
        </button>
      </div>
    </div>
  );
}
