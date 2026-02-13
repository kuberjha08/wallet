package com.wallet.wallet_backend.repository;

import com.wallet.wallet_backend.entity.PaymentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {
    List<PaymentRequest> findByTargetIdAndStatus(Long targetId, String status);
    List<PaymentRequest> findByRequesterId(Long requesterId);
    List<PaymentRequest> findByTargetId(Long targetId);
}