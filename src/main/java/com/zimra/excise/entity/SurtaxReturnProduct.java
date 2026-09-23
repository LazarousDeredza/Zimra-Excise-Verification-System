package com.zimra.excise.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "surtax_return_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurtaxReturnProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "surtax_return_id", nullable = false)
    private SurtaxReturn surtaxReturn;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", nullable = false)
    private ProductCategory productCategory;

    @Column(name = "opening_stock_on_hand", precision = 19, scale = 4)
    private BigDecimal openingStockOnHand;

    @Column(name = "external_receipts", precision = 19, scale = 4)
    private BigDecimal externalReceipts;

    @Column(name = "production", precision = 19, scale = 4)
    private BigDecimal production;

    @Column(name = "total_litres", precision = 19, scale = 4)
    private BigDecimal totalLitres;

    @Column(name = "dutiable_disposal", precision = 19, scale = 4)
    private BigDecimal dutiableDisposal;

    @Column(name = "exports", precision = 19, scale = 4)
    private BigDecimal exports;

    @Column(name = "destruction", precision = 19, scale = 4)
    private BigDecimal destruction;

    @Column(name = "closing_stock", precision = 19, scale = 4)
    private BigDecimal closingStock;

    @Column(name = "total_disposed", precision = 19, scale = 4)
    private BigDecimal totalDisposed;

    @Column(name = "declared_grams_per_litre", precision = 19, scale = 4)
    private BigDecimal declaredGramsPerLitre;

    @Column(name = "total_sugar_content", precision = 19, scale = 4)
    private BigDecimal totalSugarContent;

    @Column(name = "surtax_rate", precision = 19, scale = 6)
    private BigDecimal surtaxRate;

    @Column(name = "total_payable", precision = 19, scale = 4)
    private BigDecimal totalPayable;

    @PrePersist
    @PreUpdate
    protected void calculateProductTotals() {

        BigDecimal opening = value(openingStockOnHand);
        BigDecimal receipts = value(externalReceipts);
        BigDecimal productionValue = value(production);

        BigDecimal dutiable = value(dutiableDisposal);
        BigDecimal exportsValue = value(exports);
        BigDecimal destructionValue = value(destruction);

        BigDecimal gramsPerLitre = value(declaredGramsPerLitre);

        // Total Litres
        totalLitres = opening
                .add(receipts)
                .add(productionValue);

        // Closing Stock
        closingStock = totalLitres
                .subtract(dutiable)
                .subtract(exportsValue)
                .subtract(destructionValue);

        // Excel formula:
        // Total Disposed = Dutiable Disposal
        totalDisposed = dutiable;

        // Total Sugar Content
        totalSugarContent = totalDisposed
                .multiply(gramsPerLitre);

        // Rate based on product category
        if (productCategory == ProductCategory.CORDIALS) {
            surtaxRate = new BigDecimal("0.0005");
        } else {
            surtaxRate = new BigDecimal("0.001");
        }

        // Total Surtax
        totalPayable = totalSugarContent
                .multiply(surtaxRate);
    }

    private BigDecimal value(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}