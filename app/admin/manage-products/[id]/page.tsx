"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./create-product.module.scss";
import { toast } from 'react-toastify';
import MultiSelect from "../../shared/multi-select";
import AttributeSelector from "../../shared/attribute-selector";

const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState<number | string>("");
  const [productSalePrice, setProductSalePrice] = useState<number | string>("");
  const [productCategory, setProductCategory] = useState("");
  const [productImage, setProductImage] = useState<string>("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isPromoted, setIsPromoted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);

  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [availableProducts, setAvailableProducts] = useState<{ _id: string; name: string; image?: string }[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<{ _id: string; name: string }[]>([]);
  const [availableAttributeValues, setAvailableAttributeValues] = useState<{ _id: string; name: string; attributeId: string }[]>([]);
  const [productAttributes, setProductAttributes] = useState<{ attributeId: string; attributeValues: string[] }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const detailImageFileRef = useRef<HTMLInputElement>(null);
  const [deletedImagePaths, setDeletedImagePaths] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing) await fetchProduct();
      await fetchCategories();
      await fetchAvailableProducts();
      await fetchAttributes();
      await fetchAttributeValues();
      setLoading(false);
    };
    fetchData();
  }, [isEditing, params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`../api/products/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const { data: product } = await res.json();
      setProductName(product.name ?? "");
      setProductDescription(product.description ?? "");
      setProductPrice(product.price ?? "");
      setProductSalePrice(product.salePrice ?? "");
      setProductCategory(product.categoryId ?? "");
      setProductImage(product.image ?? "");
      setProductImages(product.images ?? []);
      setIsPromoted(product.isPromoted ?? false);
      setRelatedProducts(product.relatedProducts ?? []);
      setProductAttributes(product.attributes ?? []);
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("../api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const { data } = await res.json();
      setCategories(data ?? []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const res = await fetch("../api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const { data } = await res.json();
      // Filter out current product when editing to prevent self-reference
      const filteredProducts = isEditing
        ? data.filter((product: any) => product._id !== params.id)
        : data;
      setAvailableProducts(filteredProducts.map((product: any) => ({
        _id: product._id,
        name: product.name,
        image: product.image
      })) ?? []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await fetch("../api/attributes");
      if (!res.ok) throw new Error("Failed to fetch attributes");
      const { data } = await res.json();
      setAvailableAttributes(data ?? []);
    } catch (err) {
      console.error("Error fetching attributes:", err);
    }
  };

  const fetchAttributeValues = async () => {
    try {
      const res = await fetch("../api/attribute-values");
      if (!res.ok) throw new Error("Failed to fetch attribute values");
      const { data } = await res.json();
      setAvailableAttributeValues(data ?? []);
    } catch (err) {
      console.error("Error fetching attribute values:", err);
    }
  };

  const uploadFile = async (file: File) => {
    const response = await fetch(`../api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });
    if (!response.ok) throw new Error("Upload failed");
    const result = await response.json();
    return result.pathname;
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);

      let uploadedMainImage = productImage; // Use the existing main image if no new image is uploaded
      let uploadedDetailImages = [...productImages];

      // Upload main image if a new one is selected
      const mainImageFile = mainImageFileRef.current?.files?.[0];
      if (mainImageFile) {
        uploadedMainImage = await uploadFile(mainImageFile); // Upload the new main image
      }

      // Upload detail images if new ones are selected
      const detailFiles = detailImageFileRef.current?.files;
      if (detailFiles?.length) {
        const detailUploadResults = await Promise.all(
          Array.from(detailFiles).map((file) => uploadFile(file))
        );
        uploadedDetailImages = [
          ...uploadedDetailImages.filter((img) => !deletedImagePaths.includes(img)),
          ...detailUploadResults,
        ];
      }

      // Save the product with the updated main image and detail images
      const response = await fetch(`../api/products`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? params.id : undefined,
          name: productName,
          description: productDescription,
          price: productPrice,
          salePrice: productSalePrice,
          categoryId: productCategory,
          image: uploadedMainImage, // Pass the updated main image
          images: uploadedDetailImages,
          isPromoted: isPromoted,
          relatedProducts: relatedProducts,
          attributes: productAttributes,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Proizvod uspešno sačuvan!");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Došlo je do greške prilikom čuvanja proizvoda.");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleDeleteImage = (index: number) => {
    const combinedImages = [...productImages, ...detailImagePreviews];
    const imageToDelete = combinedImages[index];

    if (productImages.includes(imageToDelete)) {
      setProductImages((prev) => prev.filter((img) => img !== imageToDelete));
      setDeletedImagePaths((prev) => [...prev, imageToDelete]);
    } else {
      setDetailImagePreviews((prev) => prev.filter((_, i) => i !== (index - productImages.length)));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMainImageClick = () => {
    if (mainImageFileRef.current) {
      mainImageFileRef.current.click();
    }
  };

  const handleDetailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setDetailImagePreviews(previews);
  };

  const handleDetailImagesClick = () => {
    if (detailImageFileRef.current) {
      detailImageFileRef.current.click();
    }
  };
  
  if (loading) {
    return (
      <><div className="page-title">
        <h1>{isEditing ? "Izmeni proizvod" : "Dodaj proizvod"}</h1>
      </div>
      <div className={styles.productPage}>
        {/* Main Image Skeleton */}
        <div className={styles.mainImageSection}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              <div className={styles.skeletonImage}></div>
            </div>
          </div>
        </div>

        {/* Form Fields Skeletons */}
        <div className="floatingLabel">
          <div className={styles.skeletonInput}></div>
        </div>

        <div className="floatingLabel">
          <div className={styles.skeletonInput}></div>
        </div>

        <div className="floatingLabel">
          <div className={styles.skeletonTextarea}></div>
        </div>

        <div className="floatingLabel">
          <div className={styles.skeletonSelect}></div>
        </div>

        <div className="floatingLabel">
          <div className={styles.skeletonInput}></div>
        </div>

        <div className="floatingLabel">
          <div className={styles.skeletonCheckbox}></div>
        </div>

        <div className={styles.relatedProductsSection}>
          <div className={styles.sectionLabel}>Povezani proizvodi</div>
          <div className={styles.skeletonSelect}></div>
        </div>

        <div className={styles.attributesSection}>
          <div className={styles.sectionLabel}>Atributi proizvoda</div>
          <div className={styles.skeletonAttributeRow}>
            <div className={styles.skeletonSelect}></div>
            <div className={styles.skeletonSelect}></div>
          </div>
        </div>

        {/* Detail Images Skeleton */}
        <div className={styles.detailImagesSection}>
          <div>Slike detalja</div>
          <div className={styles.imagesWrapper}>
            {[...Array(3)].map((_, index) => (
              <div key={index} className={styles.imageContainer}>
                <div className={styles.skeletonImage}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className={`actions ${styles.actionsSection}`}>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
      
      </>
    );
  }

  return (
    <><div className="page-title">
      <h1>{isEditing ? "Izmeni proizvod" : "Dodaj proizvod"}</h1>
    </div><div className={styles.productPage}>

        {/* Main Image */}
        <div className={styles.mainImageSection}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              {mainImagePreview ? (
                <img src={mainImagePreview} alt="Preview" />

              ) : productImage ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <img src={`${BLOB_URL}/${productImage}`} alt="Glavna slika"  />
                </div>

              ) : (
                <button className={styles.addImageButton} onClick={handleMainImageClick}>
                  +
                  <input
                    type="file"
                    ref={mainImageFileRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                  />
                </button>
              )

              }
            </div>
            {(mainImagePreview || productImage) && (
              <button onClick={handleMainImageClick}>
                Izmeni
                <input
                  type="file"
                  ref={mainImageFileRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="floatingLabel">
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="productName">Naziv proizvoda</label>
        </div>

        <div className="floatingLabel">
          <input
            type="number"
            id="productPrice"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="productPrice">Cena proizvoda</label>
        </div>

        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Promovisan</span>
          <div className={styles.toggle} onClick={() => !actionLoading && setIsPromoted(!isPromoted)}>
            <input
              type="checkbox"
              checked={isPromoted}
              onChange={() => {}}
              disabled={actionLoading}
              readOnly
            />
            <span className={styles.toggleSlider}></span>
          </div>
        </div>

        <div className="floatingLabel">
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="productDescription">Opis proizvoda</label>
        </div>

        <div className="floatingLabel">
          <select
            className="create-select"
            id="productCategory"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            disabled={actionLoading}
            required
          >
            <option value="">Izaberi kategoriju</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <label htmlFor="productCategory">Kategorija</label>
        </div>

        <div className="floatingLabel">
          <input
            type="number"
            id="salePrice"
            value={productSalePrice}
            onChange={(e) => setProductSalePrice(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="salePrice">Akcijska cena proizvoda</label>
        </div>

        <div className={styles.relatedProductsSection}>
          <div className={styles.sectionLabel}>Povezani proizvodi</div>
          <MultiSelect
            options={availableProducts}
            selectedValues={relatedProducts}
            onSelectionChange={setRelatedProducts}
            placeholder="Izaberite povezane proizvode..."
            searchPlaceholder="Pretražite proizvode..."
            disabled={actionLoading}
          />
        </div>

        <div className={styles.attributesSection}>
          <div className={styles.sectionLabel}>Atributi proizvoda</div>
          <AttributeSelector
            attributes={availableAttributes}
            attributeValues={availableAttributeValues}
            productAttributes={productAttributes}
            onAttributesChange={setProductAttributes}
            disabled={actionLoading}
          />
        </div>

        {/* Detail Images */}
        <div className={styles.detailImagesSection}>
          <div>Slike detalja</div>
          <div className={styles.imagesWrapper}>
            {[...productImages.map((img) => `${BLOB_URL}/${img}`), ...detailImagePreviews].map(
              (src, index) => {
                return (
                  <div key={index} className={styles.imageContainer}>
                    <img
                      src={src}
                      alt="Preview"
                      style={{ width: "100px" }}
                    />
                    <button
                      type="button"
                      className={styles.deleteImageButton}
                      onClick={() => handleDeleteImage(index)}
                      disabled={actionLoading}
                    >
                      ×
                    </button>
                  </div>
                );
              }
            )}
            <button className={styles.addImageButton} onClick={handleDetailImagesClick}>
              +
              <input
                type="file"
                ref={detailImageFileRef}
                multiple
                onChange={handleDetailImageChange}
                accept="image/*"
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className={`actions ${styles.actionsSection}`}>
          <button onClick={() => router.push("/admin/manage-products")} disabled={actionLoading}>
            Nazad
          </button>
          <button className="save" onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Učitavanje..." : isEditing ? "Sačuvaj" : "Dodaj"}
          </button>
        </div>
      </div></>

  );
}
