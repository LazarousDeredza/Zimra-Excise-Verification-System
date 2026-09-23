package com.zimra.excise.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "taxpayers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Taxpayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "taxpayer_name", nullable = false)
    private String taxpayerName;

    @Column(nullable = false)
    private String address;

    @Column(name = "tin_number", nullable = false, unique = true)
    private String tin;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;



    @Column(name = "id_number")
    private String idNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "taxpayer",
            cascade = CascadeType.ALL
    )
    private List<SurtaxReturn> returns = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}