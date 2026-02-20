package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobile(String mobile);
    
    @Query("SELECT u FROM User u WHERE u.tempToken = :tempToken")
    Optional<User> findByTempToken(@Param("tempToken") String tempToken);
    
    @Query("SELECT u FROM User u WHERE u.permanentToken = :permanentToken")
    Optional<User> findByPermanentToken(@Param("permanentToken") String permanentToken);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);
    
    Optional<User> findByEmail(String email);
    
    // Admin methods
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "u.mobile LIKE CONCAT('%', :search, '%')")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "u.mobile LIKE CONCAT('%', :search, '%')")
    List<User> searchUsers(@Param("search") String search);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.walletFrozen = false")
    Long countByWalletFrozenFalse();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.walletFrozen = true")
    Long countByWalletFrozenTrue();
    
    @Query("SELECT SUM(u.walletBalance) FROM User u")
    Double sumWalletBalance();
    
    @Query("SELECT SUM(u.walletBalance) FROM User u WHERE u.createdAt < :date")
    Double sumWalletBalanceByCreatedAtBefore(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt < :date")
    Long countByCreatedAtBefore(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt BETWEEN :start AND :end")
    Long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastActive > :since")
    Long countByLastActiveAfter(@Param("since") LocalDateTime since);
}