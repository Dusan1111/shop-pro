"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./manage-products.module.scss";
import TableComponent from "../shared/smart-table";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ManageProductsCategoriesPage() {
  const { hasPermission } = useAuth();

  // Determine initial tab based on permissions
  const getInitialTab = (): 'products' | 'categories' | 'attributes' | 'attribute-values' | null => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('productsActiveTab');
      if (savedTab && (savedTab === 'products' || savedTab === 'categories' || savedTab === 'attributes' || savedTab === 'attribute-values')) {
        return savedTab as 'products' | 'categories' | 'attributes' | 'attribute-values';
      }
    }
    return null; // No default tab
  };

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'attributes' | 'attribute-values' | null>(getInitialTab());

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

  // Load data when active tab changes (only if a tab is selected)
  useEffect(() => {
    if (activeTab !== null) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data for tab:', activeTab);
      // Only fetch data for the active tab
      switch (activeTab) {
        case 'products':
          console.log('Calling getProducts API');
          await getProducts();
          break;
        case 'categories':
          console.log('Calling getCategories API');
          await getCategories();
          break;
        case 'attributes':
          console.log('Calling getAttributes API');
          await getAttributes();
          break;
        case 'attribute-values':
          console.log('Calling getAttributeValues API');
          await getAttributeValues();
          break;
      }
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

  const handleTabChange = (tab: 'products' | 'categories' | 'attributes' | 'attribute-values') => {
    setActiveTab(tab);
    localStorage.setItem('productsActiveTab', tab);
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
            {hasPermission('manage_products') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'products' ? styles.active : ''}`}
                onClick={() => handleTabChange('products')}
              >
                Proizvodi
              </button>
            )}
            {hasPermission('manage_categories') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'categories' ? styles.active : ''}`}
                onClick={() => handleTabChange('categories')}
              >
                Kategorije
              </button>
            )}
            {hasPermission('manage_attributes') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'attributes' ? styles.active : ''}`}
                onClick={() => handleTabChange('attributes')}
              >
                Atributi
              </button>
            )}
            {hasPermission('manage_attribute_values') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'attribute-values' ? styles.active : ''}`}
                onClick={() => handleTabChange('attribute-values')}
              >
                Vrednosti atributa
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === null ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                Izaberite tab da prikažete sadržaj
              </p>
            ) : activeTab === 'products' && hasPermission('manage_products') ? (
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
            ) : activeTab === 'categories' && hasPermission('manage_categories') ? (
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
            ) : activeTab === 'attributes' && hasPermission('manage_attributes') ? (
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
            ) : activeTab === 'attribute-values' && hasPermission('manage_attribute_values') ? (
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
            ) : (
              <p>Nemate permisiju za pristup ovom tabu.</p>
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