package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.KycDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {
    List<KycDocument> findByUserId(Long userId);
    
    Page<KycDocument> findByStatus(String status, Pageable pageable);
    
    @Query("SELECT k FROM KycDocument k WHERE " +
           "LOWER(k.documentType) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "k.userId IN (SELECT u.id FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<KycDocument> searchKyc(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(k) FROM KycDocument k WHERE k.status = 'PENDING'")
    Long countPendingKyc();
    
    @Query("SELECT COUNT(k) FROM KycDocument k WHERE k.status = 'APPROVED'")
    Long countByStatusApproved();
    
    @Query("SELECT COUNT(k) FROM KycDocument k WHERE k.status = 'REJECTED'")
    Long countByStatusRejected();
    
    @Query("SELECT COUNT(k) FROM KycDocument k WHERE k.status = :status")
    Long countByStatus(@Param("status") String status);
    
    @Query("SELECT COUNT(k) FROM KycDocument k WHERE k.submittedAt < :date")
    Long countBySubmittedAtBefore(@Param("date") LocalDateTime date);
    
    @Query("SELECT k FROM KycDocument k WHERE k.userId = :userId AND k.status = 'PENDING'")
    Optional<KycDocument> findPendingByUserId(@Param("userId") Long userId);
    
    @Query("SELECT DATE(k.submittedAt) as date, COUNT(k) as count " +
           "FROM KycDocument k WHERE k.submittedAt >= :since GROUP BY DATE(k.submittedAt)")
    List<Object[]> getKycTrends(@Param("since") LocalDateTime since);
}