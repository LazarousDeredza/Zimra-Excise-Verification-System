package com.zimra.excise.repository;

import com.zimra.excise.entity.SurtaxReturnProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SurtaxReturnProductRepository
        extends JpaRepository<SurtaxReturnProduct, Long> {
}