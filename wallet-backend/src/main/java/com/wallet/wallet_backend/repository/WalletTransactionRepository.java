package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<WalletTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
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