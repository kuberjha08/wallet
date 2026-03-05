package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.TransactionDetailDto;
import com.wallet.wallet_backend.dto.TransactionSummaryDto;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.TransactionService;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    
    /**
     * Get transaction history for the logged-in user
     * Supports pagination and filtering
     */
    @GetMapping("/history")
    public Map<String, Object> getUserTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        Long userId = extractUserIdFromToken(authHeader);
        return transactionService.getUserTransactions(userId, page, size, type, fromDate, toDate);
    }
    
    /**
     * Get details of a specific transaction by ID
     */
    @GetMapping("/{transactionId}")
    public TransactionDetailDto getTransactionDetails(
            @PathVariable String transactionId,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = extractUserIdFromToken(authHeader);
        return transactionService.getTransactionDetails(transactionId, userId);
    }
    
    /**
     * Get transaction statistics for the user
     */
    @GetMapping("/stats")
    public Map<String, Object> getTransactionStats(
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = extractUserIdFromToken(authHeader);
        return transactionService.getTransactionStats(userId);
    }
    
    /**
     * Search transactions by keyword
     */
    @GetMapping("/search")
    public List<TransactionSummaryDto> searchTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Long userId = extractUserIdFromToken(authHeader);
        return transactionService.searchTransactions(userId, keyword, page, size);
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