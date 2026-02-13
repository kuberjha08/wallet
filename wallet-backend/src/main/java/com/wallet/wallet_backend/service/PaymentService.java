package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.PaymentResponseDto;
import com.wallet.wallet_backend.entity.PaymentRequest;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.PaymentRequestRepository;
import com.wallet.wallet_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {
    
    private final WalletService walletService;
    private final UserRepository userRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final NotificationService notificationService;
    
    public PaymentService(WalletService walletService, UserRepository userRepository,
                         PaymentRequestRepository paymentRequestRepository,
                         NotificationService notificationService) {
        this.walletService = walletService;
        this.userRepository = userRepository;
        this.paymentRequestRepository = paymentRequestRepository;
        this.notificationService = notificationService;
    }
    
    @Transactional
    public PaymentResponseDto payByMobile(Long payerId, String payeeMobile, Double amount, String reference) {
        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));
        
        User payee = userRepository.findByMobile(payeeMobile)
                .orElseThrow(() -> new RuntimeException("Payee not found"));
        
        // Check if payee wallet is frozen
        if (payee.getWalletFrozen()) {
            throw new RuntimeException("Payee wallet is frozen");
        }
        
        // Process payment
        walletService.debit(payerId, amount, "PAYMENT_TO_" + payeeMobile);
        walletService.credit(payee.getId(), amount, "PAYMENT_FROM_" + payer.getMobile());
        
        // Send notification
        notificationService.sendPaymentNotification(payer, payee, amount);
        
        return PaymentResponseDto.builder()
                .success(true)
                .transactionId("TXN" + System.currentTimeMillis())
                .amount(amount)
                .payerName(payer.getName())
                .payeeName(payee.getName())
                .message("Payment successful")
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    @Transactional
    public PaymentResponseDto payByQR(Long payerId, String qrData, Double amount) {
        // Parse QR data to get payee information
        // For simplicity, assume QR contains payee mobile number
        String payeeMobile = extractMobileFromQR(qrData);
        return payByMobile(payerId, payeeMobile, amount, "QR_PAYMENT");
    }
    
    @Transactional
    public PaymentResponseDto requestPayment(Long requesterId, String targetMobile, 
                                           Double amount, String note) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        
        User targetUser = userRepository.findByMobile(targetMobile)
                .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        // Create payment request
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .requesterId(requesterId)
                .targetId(targetUser.getId())
                .amount(amount)
                .note(note)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        
        paymentRequestRepository.save(paymentRequest);
        
        // Send notification
        notificationService.sendPaymentRequestNotification(requester, targetUser, amount);
        
        return PaymentResponseDto.builder()
                .success(true)
                .requestId(paymentRequest.getId())
                .amount(amount)
                .message("Payment request sent")
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    @Transactional
    public void respondToPaymentRequest(Long requestId, Long userId, String action) {
        PaymentRequest paymentRequest = paymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Payment request not found"));
        
        if (!paymentRequest.getTargetId().equals(userId)) {
            throw new RuntimeException("Not authorized to respond to this request");
        }
        
        if (!"PENDING".equals(paymentRequest.getStatus())) {
            throw new RuntimeException("Payment request already processed");
        }
        
        if ("ACCEPT".equalsIgnoreCase(action)) {
            // Process payment
            payByMobile(userId, 
                       userRepository.findById(paymentRequest.getRequesterId())
                               .map(User::getMobile)
                               .orElseThrow(() -> new RuntimeException("Requester not found")),
                       paymentRequest.getAmount(),
                       "PAYMENT_REQUEST");
            
            paymentRequest.setStatus("ACCEPTED");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            paymentRequest.setStatus("REJECTED");
        } else {
            throw new RuntimeException("Invalid action. Use ACCEPT or REJECT");
        }
        
        paymentRequestRepository.save(paymentRequest);
    }
    
    public List<PaymentRequest> getPaymentRequests(Long userId) {
        return paymentRequestRepository.findByTargetIdAndStatus(userId, "PENDING");
    }
    
    public Map<String, Object> getTransactionHistory(Long userId, int page, int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("page", page);
        response.put("size", size);
        response.put("totalTransactions", 15);
        return response;
    }
    
    private String extractMobileFromQR(String qrData) {
        // Parse QR data to extract mobile number
        // For now, return dummy
        return "9876543210";
    }
}