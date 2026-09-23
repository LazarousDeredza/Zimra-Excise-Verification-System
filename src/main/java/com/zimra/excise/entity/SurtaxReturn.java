      package com.zimra.excise.entity;

    import jakarta.persistence.*;
    import lombok.*;

    import java.math.BigDecimal;
    import java.time.LocalDateTime;
    import java.util.ArrayList;
    import java.util.List;

    @Entity
    @Table(name = "surtax_returns")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class    SurtaxReturn {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "taxpayer_id", nullable = false)
        private Taxpayer taxpayer;

        @Column(name = "return_month", nullable = false)
        private Integer returnMonth;

        @Column(name = "return_year", nullable = false)
        private Integer returnYear;

        @Column(name = "manufacturer")
        private String manufacturer;

        @Column(name = "address")
        private String address;

        @OneToMany(
                mappedBy = "surtaxReturn",
                cascade = CascadeType.ALL,
                orphanRemoval = true
        )
        @Builder.Default
        private List<SurtaxReturnProduct> products = new ArrayList<>();

        @Column(name = "total_opening_stock", precision = 19, scale = 4)
        private BigDecimal totalOpeningStock;

        @Column(name = "total_external_receipts", precision = 19, scale = 4)
        private BigDecimal totalExternalReceipts;

        @Column(name = "total_production", precision = 19, scale = 4)
        private BigDecimal totalProduction;

        @Column(name = "total_litres", precision = 19, scale = 4)
        private BigDecimal totalLitres;

        @Column(name = "total_dutiable_disposal", precision = 19, scale = 4)
        private BigDecimal totalDutiableDisposal;

        @Column(name = "total_exports", precision = 19, scale = 4)
        private BigDecimal totalExports;

        @Column(name = "total_destruction", precision = 19, scale = 4)
        private BigDecimal totalDestruction;

        @Column(name = "total_closing_stock", precision = 19, scale = 4)
        private BigDecimal totalClosingStock;

        @Column(name = "total_disposed", precision = 19, scale = 4)
        private BigDecimal totalDisposed;

        @Column(name = "total_sugar_content", precision = 19, scale = 4)
        private BigDecimal totalSugarContent;

        @Column(name = "total_payable", precision = 19, scale = 4)
        private BigDecimal totalPayable;




        @OneToMany(
                mappedBy = "surtaxReturn",
                cascade = CascadeType.ALL,
                orphanRemoval = true
        )
        @Builder.Default
        private List<Payment> payments = new ArrayList<>();

        @Column(name = "total_paid", precision = 19, scale = 4)
        private BigDecimal totalPaid;

        @Column(name = "variance", precision = 19, scale = 4)
        private BigDecimal variance;



        @Enumerated(EnumType.STRING)
        @Column(name = "status")
        @Builder.Default
        private VerificationStatus status = VerificationStatus.PENDING;

        @Column(name = "submitted_at")
        private LocalDateTime submittedAt;

        @PrePersist
        protected void onCreate() {
            if (submittedAt == null) {
                submittedAt = LocalDateTime.now();
            }

            calculateTotals();
        }

        @PreUpdate
        protected void onUpdate() {
            calculateTotals();
        }




        public void calculatePaymentTotals() {

            totalPaid = BigDecimal.ZERO;

            if (payments != null) {
                for (Payment payment : payments) {

                    if (payment.getAmount() != null) {
                        totalPaid = totalPaid.add(payment.getAmount());
                    }
                }
            }

            // Calculate variance
            BigDecimal payable = totalPayable == null
                    ? BigDecimal.ZERO
                    : totalPayable;

            variance = totalPaid.subtract(payable);

            // Automatically determine verification status
            if (variance == null) {
                status = VerificationStatus.PENDING;

            } else if (variance.compareTo(BigDecimal.ZERO) >= 0) {
                status = VerificationStatus.VERIFIED;

            } else {
                status = VerificationStatus.FLAGGED;
            }
        }
        public void calculateTotals() {

            totalOpeningStock = BigDecimal.ZERO;
            totalExternalReceipts = BigDecimal.ZERO;
            totalProduction = BigDecimal.ZERO;
            totalLitres = BigDecimal.ZERO;

            totalDutiableDisposal = BigDecimal.ZERO;
            totalExports = BigDecimal.ZERO;
            totalDestruction = BigDecimal.ZERO;
            totalClosingStock = BigDecimal.ZERO;
            totalDisposed = BigDecimal.ZERO;
            totalSugarContent = BigDecimal.ZERO;
            totalPayable = BigDecimal.ZERO;

            if (products == null) {
                return;
            }

            for (SurtaxReturnProduct product : products) {
                // Make sure product values are calculated first
                product.calculateProductTotals();

                totalOpeningStock = totalOpeningStock
                        .add(value(product.getOpeningStockOnHand()));

                totalExternalReceipts = totalExternalReceipts
                        .add(value(product.getExternalReceipts()));

                totalProduction = totalProduction
                        .add(value(product.getProduction()));

                totalLitres = totalLitres
                        .add(value(product.getTotalLitres()));

                totalDutiableDisposal = totalDutiableDisposal
                        .add(value(product.getDutiableDisposal()));

                totalExports = totalExports
                        .add(value(product.getExports()));

                totalDestruction = totalDestruction
                        .add(value(product.getDestruction()));

                totalClosingStock = totalClosingStock
                        .add(value(product.getClosingStock()));

                totalDisposed = totalDisposed
                        .add(value(product.getTotalDisposed()));

                totalSugarContent = totalSugarContent
                        .add(value(product.getTotalSugarContent()));

                totalPayable = totalPayable
                        .add(value(product.getTotalPayable()));
            }

            calculatePaymentTotals();
        }

        private BigDecimal value(BigDecimal value) {
            return value == null ? BigDecimal.ZERO : value;
        }
    }