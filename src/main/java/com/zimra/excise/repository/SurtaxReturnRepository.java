
package com.zimra.excise.repository;

import com.zimra.excise.entity.SurtaxReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurtaxReturnRepository extends JpaRepository<SurtaxReturn, Long> {

    // =========================================================
    // FIND ONE
    // =========================================================

    // Find a return by ID
    Optional<SurtaxReturn> findById(Long id);


    // =========================================================
    // FIND ALL
    // =========================================================

    @Query("""
    SELECT DISTINCT sr
    FROM SurtaxReturn sr
    JOIN FETCH sr.taxpayer
    LEFT JOIN FETCH sr.products
    ORDER BY sr.returnYear DESC, sr.returnMonth DESC
""")
    List<SurtaxReturn> findAllReturns();


    @Query("""
    SELECT DISTINCT sr
    FROM SurtaxReturn sr
    JOIN FETCH sr.taxpayer
    LEFT JOIN FETCH sr.products
    WHERE sr.id = :id
""")
    Optional<SurtaxReturn> findReturnById(@Param("id") Long id);




    // =========================================================
    // DELETE
    // =========================================================

    // Delete by ID
    void deleteById(Long id);

    // Delete an entity
    void delete(SurtaxReturn surtaxReturn);

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

    // Find returns by taxpayer ID
    List<SurtaxReturn> findByTaxpayerId(Long taxpayerId);


    List<SurtaxReturn> findByTaxpayerTin(Long taxpayerTin);

    // Find returns by status
    List<SurtaxReturn> findByStatus(String status);


    // Find returns by return period
    List<SurtaxReturn> findByReturnMonthAndReturnYear(String month,String year);



    // Check if a taxpayer has already submitted a return for a period
    boolean existsByTaxpayerIdAndReturnMonthAndReturnYear(
            Long taxpayerId,
            String returnMonth,String returnYear
    );


    // Find returns for a taxpayer ordered by newest first
    List<SurtaxReturn> findByTaxpayerIdOrderByIdDesc(Long taxpayerId);


    // Find all returns with a particular status ordered by ID
    List<SurtaxReturn> findByStatusOrderByIdDesc(String status);


}