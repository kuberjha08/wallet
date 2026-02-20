package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.PagedResponse;
import com.wallet.wallet_backend.dto.TransactionAdminDto;
import com.wallet.wallet_backend.service.AdminTransactionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/transactions")
public class AdminTransactionController {
    
    private final AdminTransactionService transactionService;
    
    public AdminTransactionController(AdminTransactionService transactionService) {
        this.transactionService = transactionService;
    }
    
    @GetMapping
    public PagedResponse<TransactionAdminDto> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return transactionService.getTransactions(page, size, type, status, search);
    }
    
    @GetMapping("/summary")
    public Map<String, Object> getTransactionSummary() {
        return transactionService.getTransactionSummary();
    }
    
    @PostMapping("/export")
    public Map<String, Object> exportTransactions(
            @RequestParam String format,
            @RequestBody List<String> columns) {
        return transactionService.exportTransactions(format, columns);
    }
}