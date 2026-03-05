package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    
    Optional<WalletTransaction> findById(Long id);
    
    // ✅ SIMPLE VERSION - List return karega (bina pagination ke)
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // ✅ PAGINATED VERSION - Page return karega
    Page<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // ✅ SIMPLE VERSION - All transactions sorted
    List<WalletTransaction> findAllByOrderByCreatedAtDesc();
    
    // ✅ PAGINATED VERSION - All transactions with pagination
    Page<WalletTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    default Optional<WalletTransaction> findByTransactionId(String transactionId) {
        if (transactionId == null || !transactionId.startsWith("WLT")) {
            return Optional.empty();
        }
        try {
            Long id = Long.parseLong(transactionId.substring(3));
            return findById(id);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
    
    @Query("SELECT SUM(w.amount) FROM WalletTransaction w WHERE w.createdAt BETWEEN :start AND :end")
    Double sumAmountByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(w.amount) FROM WalletTransaction w WHERE w.createdAt BETWEEN :start AND :end AND w.type = :type")
    Double sumAmountByDateRangeAndType(@Param("start") LocalDateTime start, 
                                      @Param("end") LocalDateTime end,
                                      @Param("type") String type);
    
    @Query("SELECT COUNT(w) FROM WalletTransaction w WHERE w.createdAt BETWEEN :start AND :end")
    Long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(w) FROM WalletTransaction w WHERE w.createdAt BETWEEN :start AND :end AND w.type = :type")
    Long countByDateRangeAndType(@Param("start") LocalDateTime start, 
                                @Param("end") LocalDateTime end,
                                @Param("type") String type);
}