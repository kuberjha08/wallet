package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // Add this method
    Optional<User> findByEmail(String email);
}