package com.zimra.excise.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "surtax_return_id", nullable = false)
    private SurtaxReturn surtaxReturn;

    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false)
    private Currency currency;

    @Column(name = "bill_of_entry")
    private String billOfEntry;

    @Column(name = "receipt_number")
    private String receiptNumber;

    @Column(name = "assessment_number")
    private String assessmentNumber;
}