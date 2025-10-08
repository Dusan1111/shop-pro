"use client";

import { useState, useEffect } from "react";
import styles from "./manage-products.module.scss";
import TableComponent from "../shared/smart-table";
import { useRouter } from "next/navigation";

export default function ManageProductsCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'attributes' | 'attribute-values'>('products');

  // Product interfaces and state
  interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    categoryId: string;
    categoryName?: string;
  }

  interface Category {
    _id: string;
    name: string;
    description: string;
    image: string | null;
  }

  interface Attribute {
    _id: string;
    name: string;
  }

  interface AttributeValue {
    _id: string;
    attributeId: string;
    attributeName?: string;
    value: string;
    description: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [attributeValueToDelete, setAttributeValueToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([getProducts(), getCategories(), getAttributes(), getAttributeValues()]);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch("api/products");
      if (!response.ok) throw new Error("Greška prilikom dobavljanja proizvoda!");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch("api/categories");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const getAttributes = async () => {
    try {
      const response = await fetch("api/attributes");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const data = await response.json();
      setAttributes(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const getAttributeValues = async () => {
    try {
      const response = await fetch("api/attribute-values");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const data = await response.json();
      setAttributeValues(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };


  const handleApiResponse = async (apiCall: () => Promise<Response>) => {
    try {
      setActionLoading(true);
      const response = await apiCall();
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Greška prilikom izvršavanja akcije!");

      setApiMessage(data.message || "Akcija uspešno izvršena!");
      return data;
    } catch (error) {
      setApiMessage((error as Error).message);
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`api/products?id=${productToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setProducts((prev) => prev.filter((product) => product._id !== productToDelete));
    }
  };

  const deleteCategory = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`api/categories?id=${categoryToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setCategories((prev) => prev.filter((category) => category._id !== categoryToDelete));
    }
  };

  const deleteAttribute = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`api/attributes?id=${attributeToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setAttributes((prev) => prev.filter((attribute) => attribute._id !== attributeToDelete));
    }
  };

  const deleteAttributeValue = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`api/attribute-values?id=${attributeValueToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setAttributeValues((prev) => prev.filter((attrValue) => attrValue._id !== attributeValueToDelete));
    }
  };

  const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

  const customRenderers = {
    image: (category: Category) => (
      category.image ? (
        <img
          src={`${BLOB_URL}/${category.image}`}
          alt={category.name}
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        <span style={{ fontSize: '12px', color: '#666' }}>Nema sliku</span>
      )
    ),
  };

  return (
    <>
      <div className="page-title">
        <h1>Upravljanje Proizvodima</h1>
      </div>

      <div className={styles.manageProductsPage}>
        <div className={styles.tabCard}>
          {/* Tab Headers */}
          <div className={styles.tabHeaders}>
            <button
              className={`${styles.tabButton} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Proizvodi
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Kategorije
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'attributes' ? styles.active : ''}`}
              onClick={() => setActiveTab('attributes')}
            >
              Atributi
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'attribute-values' ? styles.active : ''}`}
              onClick={() => setActiveTab('attribute-values')}
            >
              Vrednosti atributa
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'products' ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-products/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj proizvod"}
                </button>

                {loading ? (
                  <p>Učitavanje proizvoda...</p>
                ) : (
                  <TableComponent
                    data={products}
                    columns={["ID", "Naziv", "Opis", "Cena", "Akcijska cena", "Kategorija", ""]}
                    columnKeys={["_id", "name", "description", "price", "salePrice", "categoryName"]}
                    onRowClick={(product) => router.push(`/admin/manage-products/${product._id}`)}
                    onRemove={(product: Product) => {
                      setProductToDelete(product._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={undefined}
                  />
                )}
              </>
            ) : activeTab === 'categories' ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-categories/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj kategoriju"}
                </button>

                {loading ? (
                  <p>Učitavanje kategorija...</p>
                ) : (
                  <TableComponent
                    data={categories}
                    columns={["ID", "Naziv", "Slika", ""]}
                    columnKeys={["_id", "name", "image"]}
                    onRowClick={(category) => router.push(`/admin/manage-categories/${category._id}`)}
                    onRemove={(category: Category) => {
                      setCategoryToDelete(category._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={customRenderers}
                  />
                )}
              </>
            ) : activeTab === 'attributes' ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-attributes/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj atribut"}
                </button>

                {loading ? (
                  <p>Učitavanje atributa...</p>
                ) : (
                  <TableComponent
                    data={attributes}
                    columns={["ID", "Naziv", ""]}
                    columnKeys={["_id", "name"]}
                    onRowClick={(attribute) => router.push(`/admin/manage-attributes/${attribute._id}`)}
                    onRemove={(attribute: Attribute) => {
                      setAttributeToDelete(attribute._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={undefined}
                  />
                )}
              </>
            ) : (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-attribute-values/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj vrednost atributa"}
                </button>

                {loading ? (
                  <p>Učitavanje vrednosti atributa...</p>
                ) : (
                  <TableComponent
                    data={attributeValues}
                    columns={["ID", "Atribut", "Vrednost", ""]}
                    columnKeys={["_id", "attributeName", "name"]}
                    onRowClick={(attributeValue) => router.push(`/admin/manage-attribute-values/${attributeValue._id}`)}
                    onRemove={(attributeValue: AttributeValue) => {
                      setAttributeValueToDelete(attributeValue._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={undefined}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Potvrdi brisanje</h2>
              {!apiMessage ? (
                <>
                  <p>Da li ste sigurni da želite da obrišete {
                    activeTab === 'products' ? 'ovaj proizvod' :
                    activeTab === 'categories' ? 'ovu kategoriju' :
                    activeTab === 'attributes' ? 'ovaj atribut' :
                    'ovu vrednost atributa'
                  }?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => setIsDeleting(false)} disabled={actionLoading}>
                      Nazad
                    </button>
                    <button
                      onClick={
                        activeTab === 'products' ? deleteProduct :
                        activeTab === 'categories' ? deleteCategory :
                        activeTab === 'attributes' ? deleteAttribute :
                        deleteAttributeValue
                      }
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Učitavanje..." : "Obriši"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{apiMessage}</p>
                  <button
                    className={styles.btn}
                    onClick={() => {
                      setApiMessage(null);
                      setIsDeleting(false);
                    }}
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}