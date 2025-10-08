"use client";

import { useState, useEffect } from "react";
import styles from "./attribute-selector.module.scss";
import MultiSelect from "./multi-select";

interface Attribute {
  _id: string;
  name: string;
}

interface AttributeValue {
  _id: string;
  name: string;
  attributeId: string;
}

interface ProductAttribute {
  attributeId: string;
  attributeValues: string[];
}

interface AttributeSelectorProps {
  attributes: Attribute[];
  attributeValues: AttributeValue[];
  productAttributes: ProductAttribute[];
  onAttributesChange: (attributes: ProductAttribute[]) => void;
  disabled?: boolean;
}

export default function AttributeSelector({
  attributes,
  attributeValues,
  productAttributes,
  onAttributesChange,
  disabled = false
}: AttributeSelectorProps) {

  const addNewAttribute = () => {
    // Find first available attribute that's not already selected
    const usedAttributeIds = productAttributes.map(attr => attr.attributeId);
    const availableAttribute = attributes.find(attr => !usedAttributeIds.includes(attr._id));

    if (availableAttribute) {
      const newAttribute: ProductAttribute = {
        attributeId: availableAttribute._id,
        attributeValues: []
      };
      onAttributesChange([...productAttributes, newAttribute]);
    }
  };

  const removeAttribute = (index: number) => {
    const updatedAttributes = productAttributes.filter((_, i) => i !== index);
    onAttributesChange(updatedAttributes);
  };

  const updateAttribute = (index: number, newAttributeId: string) => {
    const updatedAttributes = [...productAttributes];
    updatedAttributes[index] = {
      attributeId: newAttributeId,
      attributeValues: [] // Reset values when attribute changes
    };
    onAttributesChange(updatedAttributes);
  };

  const updateAttributeValues = (index: number, newValues: string[]) => {
    const updatedAttributes = [...productAttributes];
    updatedAttributes[index].attributeValues = newValues;
    onAttributesChange(updatedAttributes);
  };

  const getAvailableAttributes = (currentIndex: number) => {
    const usedAttributeIds = productAttributes
      .map((attr, index) => index !== currentIndex ? attr.attributeId : null)
      .filter(id => id !== null);
    return attributes.filter(attr => !usedAttributeIds.includes(attr._id));
  };

  const getAttributeValuesForAttribute = (attributeId: string) => {
    return attributeValues
      .filter(value => value.attributeId === attributeId)
      .map(value => ({ _id: value._id, name: value.name }));
  };

  const getAttributeName = (attributeId: string) => {
    return attributes.find(attr => attr._id === attributeId)?.name || '';
  };

  const canAddMoreAttributes = () => {
    return productAttributes.length < attributes.length;
  };

  return (
    <div className={styles.attributeSelector}>
      <div className={styles.attributesList}>
        {productAttributes.map((productAttribute, index) => (
          <div key={index} className={styles.attributeRow}>
            <div className={styles.attributeControls}>
              <div className={styles.attributeSelect}>
                <select
                  value={productAttribute.attributeId}
                  onChange={(e) => updateAttribute(index, e.target.value)}
                  disabled={disabled}
                  className={styles.selectInput}
                >
                  <option value="">Izaberite atribut</option>
                  {getAvailableAttributes(index).map(attr => (
                    <option key={attr._id} value={attr._id}>
                      {attr.name}
                    </option>
                  ))}
                  {/* Keep current selection visible even if it would normally be filtered out */}
                  {productAttribute.attributeId &&
                   !getAvailableAttributes(index).find(attr => attr._id === productAttribute.attributeId) && (
                    <option key={productAttribute.attributeId} value={productAttribute.attributeId}>
                      {getAttributeName(productAttribute.attributeId)}
                    </option>
                  )}
                </select>
                <label>Atribut</label>
              </div>

              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className={styles.removeButton}
                disabled={disabled}
                title="Ukloni atribut"
              >
                ×
              </button>
            </div>

            {productAttribute.attributeId && (
              <div className={styles.attributeValuesSelect}>
                <div className={styles.valuesLabel}>
                  Vrednosti za "{getAttributeName(productAttribute.attributeId)}"
                </div>
                <MultiSelect
                  options={getAttributeValuesForAttribute(productAttribute.attributeId)}
                  selectedValues={productAttribute.attributeValues}
                  onSelectionChange={(values) => updateAttributeValues(index, values)}
                  placeholder="Izaberite vrednosti atributa..."
                  searchPlaceholder="Pretražite vrednosti..."
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {canAddMoreAttributes() && (
        <button
          type="button"
          onClick={addNewAttribute}
          className={styles.addButton}
          disabled={disabled}
        >
          + Dodaj atribut
        </button>
      )}

      {productAttributes.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nema definisanih atributa za ovaj proizvod.</p>
          {canAddMoreAttributes() && (
            <button
              type="button"
              onClick={addNewAttribute}
              className={styles.addButton}
              disabled={disabled}
            >
              + Dodaj prvi atribut
            </button>
          )}
        </div>
      )}
    </div>
  );
}