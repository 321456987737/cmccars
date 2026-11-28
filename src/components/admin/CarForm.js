"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// =====================================================
// VISIBLE = Spanish, DATABASE = English
// =====================================================

const BODY_TYPES = [
  { label: "Sedán", value: "Sedan" },
  { label: "Roadster", value: "Roadster" },
  { label: "SUV", value: "SUV" },
  { label: "Coupé", value: "Coupe" },
  { label: "Descapotable", value: "Convertible" },
  { label: "Hatchback", value: "Hatchback" },
  { label: "Familiar", value: "Estate" },
  { label: "Pick-up", value: "Pickup" },
  { label: "Furgoneta", value: "Van" },
  { label: "Monovolumen", value: "MPV" },
  { label: "Otro", value: "Other" },
];

const FUEL_TYPES = [
  { label: "Gasolina", value: "Petrol" },
  { label: "Diésel", value: "Diesel" },
  { label: "Híbrido", value: "Hybrid" },
  { label: "Eléctrico", value: "Electric" },
  { label: "Híbrido enchufable", value: "Plug-in Hybrid" },
  { label: "Otro", value: "Other" },
];

const TRANSMISSIONS = [
  { label: "Automática", value: "Automatic" },
  { label: "Manual", value: "Manual" },
  { label: "CVT", value: "CVT" },
  { label: "Otra", value: "Other" },
];

const CONDITIONS = [
  { label: "Nuevo", value: "New" },
  { label: "Usado", value: "Used" },
];

const STATUSES = [
  { label: "Disponible", value: "Available" },
  { label: "Reservado", value: "Reserved" },
  { label: "Vendido", value: "Sold" },
];

const MILEAGE_UNITS = [
  { label: "km", value: "km" },
  { label: "millas", value: "miles" },
];

const MAX_IMAGES = 15;

const DEFAULT_FORM = {
  stockNumber: "",
  make: "",
  model: "",
  year: "",
  price: "",
  currency: "USD",
  mileage: "",
  mileageUnidad: "km",
  transmission: "Automatic",
  fuelType: "Petrol",
  bodyType: "SUV",
  condition: "Used",
  exteriorColor: "",
  interiorColor: "",
  engine: "",
  description: "",
  features: "",
  status: "Available",
  isFeatured: false,
};

export default function CarForm({ initialData = null }) {
  const router = useRouter();

  const [form, setForm] = useState(() => {
    if (!initialData) {
      return DEFAULT_FORM;
    }

    return {
      stockNumber: initialData.stockNumber || "",
      make: initialData.make || "",
      model: initialData.model || "",
      year: initialData.year ? String(initialData.year) : "",
      price: initialData.price !== undefined ? String(initialData.price) : "",
      currency: initialData.currency || "USD",
      mileage:
        initialData.mileage !== undefined ? String(initialData.mileage) : "",
      mileageUnidad: initialData.mileageUnidad || "km",
      transmission: initialData.transmission || "Automatic",
      fuelType: initialData.fuelType || "Petrol",
      bodyType: initialData.bodyType || "SUV",
      condition: initialData.condition || "Used",
      exteriorColor: initialData.exteriorColor || "",
      interiorColor: initialData.interiorColor || "",
      engine: initialData.engine || "",
      description: initialData.description || "",
      features: Array.isArray(initialData.features)
        ? initialData.features.join("\n")
        : "",
      status: initialData.status || "Available",
      isFeatured: Boolean(initialData.isFeatured),
    };
  });

  const [images, setImages] = useState(() => {
    if (!initialData?.images || !Array.isArray(initialData.images)) {
      return [];
    }

    return initialData.images
      .filter((image) => image && image.url)
      .map((image, index) => ({
        id: image.publicId || `existing-${index}-${image.url}`,
        url: image.url,
        publicId: image.publicId || "",
        alt: image.alt || "",
        isExisting: true,
        file: null,
        preview: image.url,
      }));
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewUrls = useRef(new Set());

  const isEdit = Boolean(initialData?._id);

  useEffect(() => {
    return () => {
      for (const url of previewUrls.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes.`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const invalidFile = filesToAdd.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (invalidFile) {
      setError("Solo se permiten imágenes JPG, PNG y WebP.");
      return;
    }

    const tooLarge = filesToAdd.find((file) => file.size > 10 * 1024 * 1024);

    if (tooLarge) {
      setError("Cada imagen debe pesar menos de 10 MB.");
      return;
    }

    const existingKeys = new Set(
      images
        .filter((image) => image.file)
        .map(
          (image) =>
            `${image.file.name}-${image.file.lastModified}-${image.file.size}`,
        ),
    );

    const newImages = filesToAdd
      .filter((file) => {
        const key = `${file.name}-${file.lastModified}-${file.size}`;

        return !existingKeys.has(key);
      })
      .map((file) => {
        const preview = URL.createObjectURL(file);

        previewUrls.current.add(preview);

        return {
          id: `${file.name}-${file.lastModified}-${file.size}`,
          file,
          preview,
          url: "",
          publicId: "",
          alt: file.name,
          isExisting: false,
        };
      });

    setImages((current) => [...current, ...newImages]);

    if (selectedFiles.length > remainingSlots) {
      setError(
        `Solo se pudieron añadir ${remainingSlots} ${
          remainingSlots === 1 ? "imagen" : "imágenes"
        } porque el máximo es ${MAX_IMAGES}.`,
      );
    }
  }

  function removeImage(index) {
    setImages((current) => {
      const image = current[index];

      if (image?.preview && !image.isExisting) {
        URL.revokeObjectURL(image.preview);

        previewUrls.current.delete(image.preview);
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  function moveImage(index, direction) {
    setImages((current) => {
      const newIndex = direction === "left" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= current.length) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

      return updated;
    });
  }

  async function uploadNewImages() {
    const newImages = images.filter((image) => image.file && !image.isExisting);

    if (newImages.length === 0) {
      return [];
    }

    const formData = new FormData();

    for (const image of newImages) {
      formData.append("files", image.file);
    }

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "No se pudieron subir las imágenes");
    }

    return result.data.images || [];
  }

  async function deleteCloudinaryImages(publicIds) {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    const response = await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicIds,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "No se pudieron eliminar las imágenes");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    let newlyUploadedPublicIds = [];

    try {
      if (!form.make.trim()) {
        throw new Error("La marca es obligatoria.");
      }

      if (!form.model.trim()) {
        throw new Error("El modelo es obligatorio.");
      }

      if (!form.year) {
        throw new Error("El año es obligatorio.");
      }

      if (!form.price) {
        throw new Error("El precio es obligatorio.");
      }

      if (images.length > MAX_IMAGES) {
        throw new Error(`Se permite un máximo de ${MAX_IMAGES} imágenes.`);
      }

      const originalPublicIds = isEdit
        ? (initialData.images || [])
            .map((image) => image.publicId)
            .filter(Boolean)
        : [];

      const currentExistingPublicIds = images
        .filter((image) => image.isExisting)
        .map((image) => image.publicId)
        .filter(Boolean);

      const removedPublicIds = originalPublicIds.filter(
        (publicId) => !currentExistingPublicIds.includes(publicId),
      );

      const hasNewImages = images.some(
        (image) => image.file && !image.isExisting,
      );

      if (hasNewImages) {
        setSuccess("Subiendo imágenes...");
      }

      const uploadedImages = await uploadNewImages();

      newlyUploadedPublicIds = uploadedImages
        .map((image) => image.publicId)
        .filter(Boolean);

      let uploadedIndex = 0;

      const finalImages = images.map((image) => {
        if (image.isExisting) {
          return {
            url: image.url,
            publicId: image.publicId,
            alt: image.alt || `${form.year} ${form.make} ${form.model}`,
          };
        }

        const uploaded = uploadedImages[uploadedIndex];
        uploadedIndex += 1;

        if (!uploaded?.url) {
          throw new Error(
            "No se pudo subir una de las imágenes. Inténtalo de nuevo.",
          );
        }

        return {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: `${form.year} ${form.make} ${form.model}`,
        };
      });

      const features = form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);

      // Payload sends ENGLISH values to DB (form already stores English)
      const payload = {
        stockNumber: form.stockNumber.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        price: Number(form.price),
        currency: form.currency.trim().toUpperCase(),
        mileage: Number(form.mileage || 0),
        mileageUnidad: form.mileageUnidad,
        transmission: form.transmission,
        fuelType: form.fuelType,
        bodyType: form.bodyType,
        condition: form.condition,
        exteriorColor: form.exteriorColor.trim(),
        interiorColor: form.interiorColor.trim(),
        engine: form.engine.trim(),
        description: form.description.trim(),
        features,
        images: finalImages,
        status: form.status,
        isFeatured: form.isFeatured,
      };

      setSuccess(isEdit ? "Actualizando vehículo..." : "Añadiendo vehículo...");

      const endpoint = isEdit
        ? `/api/admin/cars/${initialData._id}`
        : "/api/admin/cars";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `No se pudo ${isEdit ? "actualizar" : "crear"} el vehículo`,
        );
      }

      let cleanupWarning = "";

      if (removedPublicIds.length > 0) {
        try {
          await deleteCloudinaryImages(removedPublicIds);
        } catch (deleteError) {
          console.error("Eliminar image cleanup error:", deleteError);

          cleanupWarning =
            " El vehículo se guardó, pero algunas imágenes eliminadas no pudieron borrarse de Cloudinary.";
        }
      }

      setSuccess(
        `${
          isEdit
            ? "Vehículo actualizado correctamente."
            : "Vehículo añadido correctamente."
        }${cleanupWarning}`,
      );

      setTimeout(() => {
        router.push("/admin/cars");
        router.refresh();
      }, 900);
    } catch (submitError) {
      console.error("Car form submit error:", submitError);

      if (newlyUploadedPublicIds.length > 0) {
        try {
          await deleteCloudinaryImages(newlyUploadedPublicIds);
        } catch (cleanupError) {
          console.error("New upload cleanup error:", cleanupError);
        }
      }

      setSuccess("");

      setError(submitError.message || "Algo salió mal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-5 md:pb-24 pb-2 sm:space-y-6 lg:space-y-8"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:p-5">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700 sm:p-5">
          {success}
        </div>
      )}

      <FormSection
        title="Información básica"
        description="Introduce la información principal que verán los clientes sobre este vehículo."
      >
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <InputField
            label="Marca"
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="【entity-BMW¦canonical_name=BMW】"
            required
          />

          <InputField
            label="Modelo"
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="M4 Competition"
            required
          />

          <InputField
            label="Año"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            placeholder="2024"
            min="1900"
            max="2100"
            required
          />

          <InputField
            label="Número de inventario"
            name="stockNumber"
            value={form.stockNumber}
            onChange={handleChange}
            placeholder="BMW-M4-024"
          />
        </div>
      </FormSection>

      <FormSection
        title="Precio y kilometraje"
        description="Establece el precio y el kilometraje del vehículo."
      >
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InputField
            label="Precio"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="75000"
            min="0"
            required
          />

          <SelectField
            label="Moneda"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            options={["USD", "QAR", "AED", "SAR", "EUR", "GBP"]}
          />

          <div className="grid min-w-0 grid-cols-2 gap-3">
            <InputField
              label="Kilometraje"
              name="mileage"
              type="number"
              value={form.mileage}
              onChange={handleChange}
              placeholder="8000"
              min="0"
            />

            <SelectField
              label="Unidad"
              name="mileageUnidad"
              value={form.mileageUnidad}
              onChange={handleChange}
              options={MILEAGE_UNITS}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Especificaciones del vehículo"
        description="Añade las especificaciones que los clientes pueden usar para comparar vehículos."
      >
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label="Tipo de carrocería"
            name="bodyType"
            value={form.bodyType}
            onChange={handleChange}
            options={BODY_TYPES}
          />

          <SelectField
            label="Tipo de combustible"
            name="fuelType"
            value={form.fuelType}
            onChange={handleChange}
            options={FUEL_TYPES}
          />

          <SelectField
            label="Transmisión"
            name="transmission"
            value={form.transmission}
            onChange={handleChange}
            options={TRANSMISSIONS}
          />

          <SelectField
            label="Estado"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            options={CONDITIONS}
          />

          <InputField
            label="Motor"
            name="engine"
            value={form.engine}
            onChange={handleChange}
            placeholder="3.0L Twin-Turbo"
          />

          <InputField
            label="Color exterior"
            name="exteriorColor"
            value={form.exteriorColor}
            onChange={handleChange}
            placeholder="Negro"
          />

          <InputField
            label="Color interior"
            name="interiorColor"
            value={form.interiorColor}
            onChange={handleChange}
            placeholder="Cuero negro"
          />
        </div>
      </FormSection>

      <FormSection
        title="Descripción"
        description="Escribe la descripción que aparecerá en la página de detalles del vehículo."
      >
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={7}
          maxLength={5000}
          placeholder="Cuéntales a los clientes sobre este vehículo, su estado, historial y detalles destacados..."
          className="w-full min-w-0 resize-y rounded-xl border border-black/15 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-black sm:px-4 sm:py-4"
        />
      </FormSection>

      <FormSection
        title="Características y equipamiento"
        description="Introduce una característica por línea."
      >
        <textarea
          name="features"
          value={form.features}
          onChange={handleChange}
          rows={8}
          placeholder={`Apple CarPlay
Asientos de cuero
Cámara 360°
Control de crucero adaptativo
Techo panorámico`}
          className="w-full min-w-0 resize-y rounded-xl border border-black/15 px-4 py-3.5 text-sm leading-6 outline-none placeholder:text-black/30 focus:border-black sm:px-4 sm:py-4"
        />
      </FormSection>

      <FormSection
        title="Imágenes del vehículo"
        description={`Sube hasta ${MAX_IMAGES} imágenes. La primera imagen se usará como imagen principal del vehículo.`}
      >
        <div className="space-y-5">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-black/[0.02] px-4 py-7 text-center transition hover:border-black hover:bg-black/[0.035] sm:min-h-36 sm:px-6 sm:py-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg font-semibold text-white sm:h-12 sm:w-12">
              +
            </div>

            <p className="mt-3 text-sm font-semibold sm:mt-4">
              Elige las imágenes del vehículo
            </p>

            <p className="mt-1 text-xs leading-5 text-black/40 sm:text-xs">
              JPG, PNG o WebP · Máximo 10 MB por archivo
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelection}
              className="hidden"
            />
          </label>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-xs text-black/45">
              {images.length} / {MAX_IMAGES} imágenes seleccionadas
            </p>

            {images.length > 0 && (
              <p className="text-xs text-black/40">
                Primera imagen = imagen principal
              </p>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-black/[0.04] sm:aspect-[16/10] lg:aspect-[4/3]">
                  <img
                    src={images[0].preview}
                    alt={images[0].alt || `${form.make} ${form.model}`}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm sm:text-sm">
                    Imagen principal
                  </div>

                  {images[0].isExisting && (
                    <div className="absolute right-3 top-3 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white sm:text-sm">
                      Guardada
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold opacity-30"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      disabled={images.length <= 1 || submitting}
                      onClick={() => moveImage(0, "right")}
                      className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => removeImage(0)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {images.slice(1).map((image, smallIndex) => {
                    const index = smallIndex + 1;

                    return (
                      <div
                        key={image.id}
                        className="min-w-0 overflow-hidden rounded-xl border border-black/10 bg-white sm:rounded-2xl"
                      >
                        <div className="relative aspect-square overflow-hidden bg-black/[0.04]">
                          <img
                            src={image.preview}
                            alt={image.alt || `${form.make} ${form.model}`}
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold shadow-sm sm:text-xs">
                            {index + 1}
                          </div>

                          {image.isExisting && (
                            <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-semibold text-white sm:text-xs">
                              Guardada
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 p-2">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={index === 0 || submitting}
                              onClick={() => moveImage(index, "left")}
                              className="rounded-md border border-black/10 px-2 py-1.5 text-xs font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ←
                            </button>

                            <button
                              type="button"
                              disabled={
                                index === images.length - 1 || submitting
                              }
                              onClick={() => moveImage(index, "right")}
                              className="rounded-md border border-black/10 px-2 py-1.5 text-xs font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              →
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => removeImage(index)}
                            className="rounded-md border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Configuración del inventario"
        description="Controla cómo se muestra este vehículo en el sitio web."
      >
        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <SelectField
            label="Estado"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUSES}
          />

          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 sm:items-center sm:py-2.5">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black sm:mt-0"
            />

            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                Vehículo destacado
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-black/40">
                Muestra este vehículo en la sección destacada de la página de inicio.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end sm:pt-6">
        <Link
          href="/admin/cars"
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/15 px-7 text-sm font-semibold transition hover:bg-black hover:text-white active:scale-[0.98] sm:w-auto"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting
            ? isEdit
              ? "Actualizando..."
              : "Añadiendo..."
            : isEdit
              ? "Actualizar vehículo"
              : "Añadir vehículo"}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-black/10 bg-white p-4 sm:p-6 lg:p-8">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-black/45 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="h-11 w-full min-w-0 rounded-xl border border-black/15 bg-white px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black"
      >
        {options.map((option) => {
          // Supports both "USD" and { label: "Gasolina", value: "Petrol" }
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}