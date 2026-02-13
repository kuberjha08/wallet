package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.PaymentResponseDto;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.PaymentService;
import com.wallet.wallet_backend.service.WalletService;
import io.jsonwebtoken.Claims;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {
    
    private final PaymentService paymentService;
    private final WalletService walletService;
    private final UserRepository userRepository;
    
    public PaymentController(PaymentService paymentService, WalletService walletService, 
                           UserRepository userRepository) {
        this.paymentService = paymentService;
        this.walletService = walletService;
        this.userRepository = userRepository;
    }
    
    // Pay by mobile number
    @PostMapping("/by-mobile")
    public PaymentResponseDto payByMobile(@RequestBody PayByMobileRequest request,
                                         @RequestHeader("Authorization") String authHeader) {
        Long payerId = extractUserIdFromToken(authHeader);
        return paymentService.payByMobile(payerId, request.getMobile(), request.getAmount(), 
                                         request.getReference());
    }
    
    // Pay by QR code
    @PostMapping("/by-qr")
    public PaymentResponseDto payByQR(@RequestBody PayByQRRequest request,
                                     @RequestHeader("Authorization") String authHeader) {
        Long payerId = extractUserIdFromToken(authHeader);
        return paymentService.payByQR(payerId, request.getQrData(), request.getAmount());
    }
    
    // Request payment from someone
    @PostMapping("/request")
    public PaymentResponseDto requestPayment(@RequestBody RequestPaymentRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        Long requesterId = extractUserIdFromToken(authHeader);
        return paymentService.requestPayment(requesterId, request.getMobile(), 
                                           request.getAmount(), request.getNote());
    }
    
    // Get payment requests
    @GetMapping("/requests")
    public Object getPaymentRequests(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        return paymentService.getPaymentRequests(userId);
    }
    
    // Accept/reject payment request
    @PostMapping("/requests/{requestId}/respond")
    public Map<String, String> respondToPaymentRequest(
            @PathVariable Long requestId,
            @RequestBody RespondToRequest request,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        paymentService.respondToPaymentRequest(requestId, userId, request.getAction());
        return Map.of("message", "Payment request " + request.getAction().toLowerCase() + "ed");
    }
    
    // Get transaction history
    @GetMapping("/history")
    public Object getTransactionHistory(@RequestHeader("Authorization") String authHeader,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        Long userId = extractUserIdFromToken(authHeader);
        return paymentService.getTransactionHistory(userId, page, size);
    }
    
    // Add money to wallet (simulate bank transfer)
    @PostMapping("/add-money")
    public Map<String, String> addMoney(@RequestBody AddMoneyRequest request,
                                       @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        walletService.credit(userId, request.getAmount(), "BANK_TRANSFER");
        return Map.of(
            "message", "Money added successfully",
            "newBalance", String.valueOf(getUserBalance(userId))
        );
    }
    
    // Withdraw money
    @PostMapping("/withdraw")
    public Map<String, String> withdrawMoney(@RequestBody WithdrawRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        walletService.debit(userId, request.getAmount(), "WITHDRAWAL");
        return Map.of(
            "message", "Withdrawal initiated successfully",
            "transactionId", generateTransactionId(),
            "newBalance", String.valueOf(getUserBalance(userId))
        );
    }
    
    @Getter @Setter
    static class PayByMobileRequest {
        private String mobile;
        private Double amount;
        private String reference;
    }
    
    @Getter @Setter
    static class PayByQRRequest {
        private String qrData;
        private Double amount;
    }
    
    @Getter @Setter
    static class RequestPaymentRequest {
        private String mobile;
        private Double amount;
        private String note;
    }
    
    @Getter @Setter
    static class RespondToRequest {
        private String action;
    }
    
    @Getter @Setter
    static class AddMoneyRequest {
        private Double amount;
    }
    
    @Getter @Setter
    static class WithdrawRequest {
        private Double amount;
        private String bankAccount;
    }
    
    private Double getUserBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getWalletBalance)
                .orElse(0.0);
    }
    
    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis();
    }
    
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtil.validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}