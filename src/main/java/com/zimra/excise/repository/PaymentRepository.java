package com.zimra.excise.repository;

import com.zimra.excise.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {


    @Query("""
    SELECT p
    FROM Payment p
    JOIN FETCH p.surtaxReturn sr
    WHERE sr.id IN :returnIds
""")
    List<Payment> findBySurtaxReturnIds(
            @Param("returnIds") List<Long> returnIds
    );

    @Query("""
        SELECT p
        FROM Payment p
        WHERE p.surtaxReturn.id = :returnId
    """)
    List<Payment> findBySurtaxReturnId(
            @Param("returnId") Long returnId
    );
}