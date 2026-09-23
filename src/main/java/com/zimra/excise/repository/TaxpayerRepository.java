package com.zimra.excise.repository;


import com.zimra.excise.entity.Taxpayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxpayerRepository
        extends JpaRepository<Taxpayer, Long> {

    Optional<Taxpayer> findByTin(String tin);


    // =========================================================
    // FIND ONE
    // =========================================================

    // Find a return by ID
    Optional<Taxpayer> findById(Long id);


    // =========================================================
    // FIND ALL
    // =========================================================

    // Find all returns
    List<Taxpayer> findAll();

    // =========================================================
    // DELETE
    // =========================================================

    // Delete by ID
    void deleteById(Long id);

    // Delete an entity
    void delete(Taxpayer taxpayer);

    // Delete all
    void deleteAll();


    // =========================================================
    // CHECK EXISTENCE
    // =========================================================

    boolean existsById(Long id);


    // =========================================================
    // COUNT
    // =========================================================

    long count();


    // =========================================================
    // CUSTOM FIND QUERIES
    // =========================================================
    boolean existsByTin(String tinNumber);






    @Query("""
        SELECT DISTINCT t
        FROM Taxpayer t
        LEFT JOIN FETCH t.returns
        ORDER BY t.taxpayerName
    """)
    List<Taxpayer> findAllWithReturns();

    @Query("""
        SELECT DISTINCT t
        FROM Taxpayer t
        LEFT JOIN FETCH t.returns
        WHERE t.id = :id
    """)
    Optional<Taxpayer> findByIdWithReturns(Long id);





}
