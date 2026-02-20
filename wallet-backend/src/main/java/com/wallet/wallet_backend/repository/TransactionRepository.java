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

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    
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
    
    // SQL Server ke liye fixed query - CAST ki jagah CONVERT use karo
    @Query(value = "SELECT CONVERT(DATE, t.created_at) as date, COUNT(t.id) as count, SUM(t.amount) as volume " +
           "FROM transactions t WHERE t.created_at >= :since GROUP BY CONVERT(DATE, t.created_at)", 
           nativeQuery = true)
    List<Map<String, Object>> getTransactionTrends(@Param("since") LocalDateTime since);
    
    @Query("SELECT t.type, COUNT(t) as count, SUM(t.amount) as total " +
           "FROM Transaction t WHERE t.createdAt >= :since GROUP BY t.type")
    List<Map<String, Object>> getTransactionSummary(@Param("since") LocalDateTime since);
    
    // YEH DO METHOD HAIN - CHECK KARO KI YE SAHI SE KAAM KAR RAHE HAIN
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.type = :type")
    Double sumAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
}