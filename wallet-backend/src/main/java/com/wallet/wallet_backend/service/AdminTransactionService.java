package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.PagedResponse;
import com.wallet.wallet_backend.dto.TransactionAdminDto;
import com.wallet.wallet_backend.entity.Transaction;
import com.wallet.wallet_backend.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminTransactionService {
    
    private final TransactionRepository transactionRepository;
    
    public AdminTransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    
    public PagedResponse<TransactionAdminDto> getTransactions(
            int page, int size, String type, String status, String search) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage;
        
        if (search != null && !search.isEmpty()) {
            transactionPage = transactionRepository.searchTransactions(search, pageable);
        } else if (type != null && !type.isEmpty() && !"all".equals(type)) {
            transactionPage = transactionRepository.findByType(type.toUpperCase(), pageable);
        } else if (status != null && !status.isEmpty() && !"all".equals(status)) {
            transactionPage = transactionRepository.findByStatus(status.toUpperCase(), pageable);
        } else {
            transactionPage = transactionRepository.findAll(pageable);
        }
        
        List<TransactionAdminDto> transactions = transactionPage.getContent().stream()
                .map(this::mapToTransactionAdminDto)
                .collect(Collectors.toList());
        
        return PagedResponse.<TransactionAdminDto>builder()
                .content(transactions)
                .page(page)
                .size(size)
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .build();
    }
    
    public Map<String, Object> getTransactionSummary() {
        Map<String, Object> summary = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        
        Double todayVolume = transactionRepository.sumAmountByDateRange(startOfDay, now);
        Long todayCount = transactionRepository.countByDateRange(startOfDay, now);
        
        LocalDateTime yesterdayStart = startOfDay.minusDays(1);
        Double yesterdayVolume = transactionRepository.sumAmountByDateRange(yesterdayStart, startOfDay);
        
        summary.put("todayVolume", todayVolume != null ? todayVolume : 0.0);
        summary.put("todayCount", todayCount != null ? todayCount : 0);
        summary.put("yesterdayVolume", yesterdayVolume != null ? yesterdayVolume : 0.0);
        summary.put("totalTransactions", transactionRepository.count());
        
        return summary;
    }
    
    public Map<String, Object> exportTransactions(String format, List<String> columns) {
        // This would generate CSV/PDF/Excel file
        Map<String, Object> export = new HashMap<>();
        export.put("format", format);
        export.put("columns", columns);
        export.put("url", "/exports/transactions-" + System.currentTimeMillis() + "." + format);
        return export;
    }
    
    private TransactionAdminDto mapToTransactionAdminDto(Transaction transaction) {
        return TransactionAdminDto.builder()
                .id(transaction.getId())
                .transactionId(transaction.getTransactionId())
                .userName(transaction.getUserName())
                .userAvatar("https://via.placeholder.com/32")
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .date(transaction.getCreatedAt())
                .paymentMethod(transaction.getPaymentMethod())
                .build();
    }
}