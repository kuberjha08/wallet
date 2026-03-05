package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByTransactionId(String transactionId);
    
    // ============ DONO METHODS ADD KARO ============
    
    // 1. Paginated version (with Pageable)
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    
    // 2. Simple version (without Pageable) - YEH MISSING THA
    List<Transaction> findByUserId(Long userId);
    
    // 3. With type filter
    Page<Transaction> findByUserIdAndType(Long userId, String type, Pageable pageable);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.type = :type")
    Double sumAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.type = :type AND t.createdAt >= :date")
    Double sumAmountByUserIdAndTypeAndDateAfter(@Param("userId") Long userId, 
                                                @Param("type") String type,
                                                @Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId AND t.createdAt >= :date")
    Long countByUserIdAndDateAfter(@Param("userId") Long userId, @Param("date") LocalDateTime date);
    
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND " +
           "(LOWER(t.transactionId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.reference) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Transaction> searchUserTransactions(@Param("userId") Long userId,
                                             @Param("keyword") String keyword,
                                             Pageable pageable);
    
    // Admin methods
    Page<Transaction> findByStatus(String status, Pageable pageable);
    Page<Transaction> findByType(String type, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE " +
           "LOWER(t.transactionId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.userName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Transaction> searchTransactions(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt BETWEEN :start AND :end")
    Long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.createdAt BETWEEN :start AND :end")
    Double sumAmountByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query(value = "SELECT CONVERT(DATE, t.created_at) as date, COUNT(t.id) as count, SUM(t.amount) as volume " +
           "FROM transactions t WHERE t.created_at >= :since GROUP BY CONVERT(DATE, t.created_at)", 
           nativeQuery = true)
    List<Map<String, Object>> getTransactionTrends(@Param("since") LocalDateTime since);
    
    @Query("SELECT t.type, COUNT(t) as count, SUM(t.amount) as total " +
           "FROM Transaction t WHERE t.createdAt >= :since GROUP BY t.type")
    List<Map<String, Object>> getTransactionSummary(@Param("since") LocalDateTime since);
}