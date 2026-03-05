package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.TransactionDetailDto;
import com.wallet.wallet_backend.dto.TransactionSummaryDto;
import com.wallet.wallet_backend.entity.Transaction;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.entity.WalletTransaction;
import com.wallet.wallet_backend.repository.TransactionRepository;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.repository.WalletTransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    
    public TransactionService(
            TransactionRepository transactionRepository,
            WalletTransactionRepository walletTransactionRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.userRepository = userRepository;
    }
    
    // ==================== HISTORY METHODS - FULL VERSION ====================
    
    public Map<String, Object> getUserTransactions(Long userId, int page, int size, 
                                               String type, String fromDate, String toDate) {
    
    // SIMPLE APPROACH - Direct list le lo
    List<Transaction> mainTxns = transactionRepository.findByUserId(userId);
    List<WalletTransaction> walletTxns = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    
    // Combine all transactions
    List<TransactionSummaryDto> allTransactions = new ArrayList<>();
    
    // Add main transactions
    for (Transaction tx : mainTxns) {
        allTransactions.add(mapToSummaryDto(tx));
    }
    
    // Add wallet transactions
    for (WalletTransaction tx : walletTxns) {
        allTransactions.add(mapToSummaryDto(tx, userId));
    }
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) -> b.getDate().compareTo(a.getDate()));
    
    // Paginate
    int start = page * size;
    int end = Math.min(start + size, allTransactions.size());
    List<TransactionSummaryDto> paginatedList = start < allTransactions.size() 
            ? allTransactions.subList(start, end) 
            : new ArrayList<>();
    
    Map<String, Object> response = new HashMap<>();
    response.put("transactions", paginatedList);
    response.put("currentPage", page);
    response.put("totalPages", (int) Math.ceil((double) allTransactions.size() / size));
    response.put("totalTransactions", allTransactions.size());
    
    return response;
}
    // ==================== HISTORY METHODS - SIMPLE VERSION ====================
    
    public Map<String, Object> getUserTransactionsSimple(Long userId, int page, int size) {
        // Simple approach - direct lists
        List<Transaction> mainTxns = transactionRepository.findByUserId(userId);
        List<WalletTransaction> walletTxns = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Combine
        List<TransactionSummaryDto> allTxns = new ArrayList<>();
        mainTxns.forEach(tx -> allTxns.add(mapToSummaryDto(tx)));
        walletTxns.forEach(tx -> allTxns.add(mapToSummaryDto(tx, userId)));
        
        // Sort
        allTxns.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        
        // Paginate
        int start = page * size;
        int end = Math.min(start + size, allTxns.size());
        List<TransactionSummaryDto> pageTxns = start < allTxns.size() ? 
                allTxns.subList(start, end) : new ArrayList<>();
        
        // Stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allTxns.size());
        stats.put("totalReceived", calculateTotal(mainTxns, "CREDIT"));
        stats.put("totalSent", calculateTotal(mainTxns, "DEBIT"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactions", pageTxns);
        response.put("stats", stats);
        response.put("page", page);
        response.put("totalPages", (int) Math.ceil((double) allTxns.size() / size));
        response.put("totalTransactions", allTxns.size());
        
        return response;
    }
    
    private Double calculateTotal(List<Transaction> txns, String type) {
        return txns.stream()
                .filter(t -> type.equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }
    
    // ==================== STATS METHODS ====================
    
    public Map<String, Object> getTransactionStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Double totalReceived = transactionRepository.sumAmountByUserIdAndType(userId, "CREDIT");
        Double totalSent = transactionRepository.sumAmountByUserIdAndType(userId, "DEBIT");
        Long totalCount = transactionRepository.countByUserId(userId);
        
        // Get this month's transactions
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double thisMonthReceived = transactionRepository.sumAmountByUserIdAndTypeAndDateAfter(userId, "CREDIT", startOfMonth);
        Double thisMonthSent = transactionRepository.sumAmountByUserIdAndTypeAndDateAfter(userId, "DEBIT", startOfMonth);
        Long thisMonthCount = transactionRepository.countByUserIdAndDateAfter(userId, startOfMonth);
        
        stats.put("totalReceived", totalReceived != null ? totalReceived : 0.0);
        stats.put("totalSent", totalSent != null ? totalSent : 0.0);
        stats.put("totalTransactions", totalCount != null ? totalCount : 0);
        stats.put("thisMonthReceived", thisMonthReceived != null ? thisMonthReceived : 0.0);
        stats.put("thisMonthSent", thisMonthSent != null ? thisMonthSent : 0.0);
        stats.put("thisMonthTransactions", thisMonthCount != null ? thisMonthCount : 0);
        
        return stats;
    }
    
    // ==================== DETAILS METHODS ====================
    
    public TransactionDetailDto getTransactionDetails(String transactionId, Long userId) {
        
        // Try to find in main Transaction table
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElse(null);
        
        if (transaction != null) {
            return mapToDetailDto(transaction, userId);
        }
        
        // If not found, try WalletTransaction table
        WalletTransaction walletTransaction = walletTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        return mapToDetailDto(walletTransaction, userId);
    }
    
    // ==================== SEARCH METHODS ====================
    
    public List<TransactionSummaryDto> searchTransactions(Long userId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> transactionPage = transactionRepository.searchUserTransactions(userId, keyword, pageable);
        
        return transactionPage.getContent().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }
    
    // ==================== HELPER METHODS ====================
    
    private List<TransactionSummaryDto> filterByDate(List<TransactionSummaryDto> transactions, 
                                                     String fromDate, String toDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
        
        LocalDateTime from = null;
        LocalDateTime to = null;
        
        if (fromDate != null) {
            from = LocalDate.parse(fromDate, formatter).atStartOfDay();
        }
        if (toDate != null) {
            to = LocalDate.parse(toDate, formatter).atTime(23, 59, 59);
        }
        
        LocalDateTime finalFrom = from;
        LocalDateTime finalTo = to;
        
        return transactions.stream()
                .filter(t -> {
                    boolean afterFrom = finalFrom == null || !t.getDate().isBefore(finalFrom);
                    boolean beforeTo = finalTo == null || !t.getDate().isAfter(finalTo);
                    return afterFrom && beforeTo;
                })
                .collect(Collectors.toList());
    }
    
    // ==================== MAPPING METHODS ====================
    
    private TransactionSummaryDto mapToSummaryDto(Transaction tx) {
        String counterparty = extractCounterparty(tx);
        String transactionType = tx.getType();
        
        if ("CREDIT".equals(transactionType) || "DEPOSIT".equals(transactionType)) {
            transactionType = "CREDIT";
        } else {
            transactionType = "DEBIT";
        }
        
        return TransactionSummaryDto.builder()
                .id(tx.getTransactionId())
                .type(transactionType)
                .amount(tx.getAmount())
                .counterparty(counterparty)
                .description(tx.getReference() != null ? tx.getReference() : "Transaction")
                .date(tx.getCreatedAt())
                .status(tx.getStatus())
                .paymentMethod(tx.getPaymentMethod() != null ? tx.getPaymentMethod() : "Wallet")
                .build();
    }
    
    private TransactionSummaryDto mapToSummaryDto(WalletTransaction tx, Long userId) {
        String type = tx.getType(); // CREDIT or DEBIT
        String description = tx.getReference();
        String counterparty = "";
        
        if ("CREDIT".equals(type)) {
            counterparty = "Bank Transfer";
            if (description == null) description = "Money added to wallet";
        } else {
            counterparty = "Bank Withdrawal";
            if (description == null) description = "Money withdrawn from wallet";
        }
        
        return TransactionSummaryDto.builder()
                .id("WLT" + tx.getId())
                .type(type)
                .amount(tx.getAmount())
                .counterparty(counterparty)
                .description(description)
                .date(tx.getCreatedAt())
                .status(tx.getStatus())
                .paymentMethod("Wallet")
                .build();
    }
    
    private TransactionDetailDto mapToDetailDto(Transaction tx, Long userId) {
        
        // Verify user owns this transaction
        if (!tx.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this transaction");
        }
        
        // Get counterparty details
        User user = userRepository.findById(tx.getUserId()).orElse(null);
        User counterparty = findCounterpartyUser(tx);
        
        TransactionDetailDto.CounterpartyDto from = null;
        TransactionDetailDto.CounterpartyDto to = null;
        
        if ("CREDIT".equals(tx.getType()) || "DEPOSIT".equals(tx.getType())) {
            // Money received
            from = mapToCounterpartyDto(counterparty);
            to = mapToCounterpartyDto(user);
        } else {
            // Money sent
            from = mapToCounterpartyDto(user);
            to = mapToCounterpartyDto(counterparty);
        }
        
        return TransactionDetailDto.builder()
                .transactionId(tx.getTransactionId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .reference(tx.getReference())
                .description(generateDescription(tx))
                .date(tx.getCreatedAt())
                .from(from)
                .to(to)
                .paymentMethod(tx.getPaymentMethod() != null ? tx.getPaymentMethod() : "Wallet")
                .category(categorizeTransaction(tx))
                .note(tx.getReference())
                .balanceAfter(tx.getBalanceAfter())
                .ipAddress(tx.getIpAddress())
                .deviceInfo(tx.getDeviceInfo())
                .settledAt(tx.getCreatedAt().plusMinutes(5)) // Example
                .build();
    }
    
    private TransactionDetailDto mapToDetailDto(WalletTransaction tx, Long userId) {
        
        // Verify user owns this transaction
        if (!tx.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this transaction");
        }
        
        User user = userRepository.findById(tx.getUserId()).orElse(null);
        
        TransactionDetailDto.CounterpartyDto from = null;
        TransactionDetailDto.CounterpartyDto to = null;
        
        if ("CREDIT".equals(tx.getType())) {
            // Money received (e.g., Add Money)
            from = TransactionDetailDto.CounterpartyDto.builder()
                    .id(0L)
                    .name("Bank Transfer")
                    .mobile("N/A")
                    .build();
            to = mapToCounterpartyDto(user);
        } else {
            // Money sent (e.g., Withdrawal)
            from = mapToCounterpartyDto(user);
            to = TransactionDetailDto.CounterpartyDto.builder()
                    .id(0L)
                    .name("Bank Withdrawal")
                    .mobile("N/A")
                    .build();
        }
        
        return TransactionDetailDto.builder()
                .transactionId("WLT" + tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .reference(tx.getReference())
                .description(generateDescription(tx))
                .date(tx.getCreatedAt())
                .from(from)
                .to(to)
                .paymentMethod("Wallet")
                .category(tx.getType().equals("CREDIT") ? "Money Added" : "Money Withdrawn")
                .note(tx.getReference())
                .balanceAfter(tx.getBalanceAfter())
                .settledAt(tx.getCreatedAt().plusMinutes(2))
                .build();
    }
    
    private TransactionDetailDto.CounterpartyDto mapToCounterpartyDto(User user) {
        if (user == null) return null;
        
        return TransactionDetailDto.CounterpartyDto.builder()
                .id(user.getId())
                .name(user.getName())
                .mobile(user.getMobile())
                .email(user.getEmail())
                .avatar(user.getProfilePicture())
                .build();
    }
    
    // ==================== HELPER METHODS ====================
    
    private String extractCounterparty(Transaction tx) {
        String ref = tx.getReference();
        if (ref == null) return "";
        
        if (ref.contains("TO_")) {
            return ref.substring(ref.indexOf("TO_") + 3);
        } else if (ref.contains("FROM_")) {
            return ref.substring(ref.indexOf("FROM_") + 5);
        } else if (ref.contains("PAYMENT_TO_")) {
            return ref.substring(ref.indexOf("PAYMENT_TO_") + 11);
        } else if (ref.contains("PAYMENT_FROM_")) {
            return ref.substring(ref.indexOf("PAYMENT_FROM_") + 13);
        }
        
        return ref;
    }
    
    private User findCounterpartyUser(Transaction tx) {
        String ref = tx.getReference();
        if (ref != null) {
            if (ref.contains("TO_")) {
                String mobile = ref.substring(ref.indexOf("TO_") + 3);
                return userRepository.findByMobile(mobile).orElse(null);
            }
            if (ref.contains("FROM_")) {
                String mobile = ref.substring(ref.indexOf("FROM_") + 5);
                return userRepository.findByMobile(mobile).orElse(null);
            }
        }
        return null;
    }
    
    private String generateDescription(Transaction tx) {
        if (tx.getReference() != null) {
            return tx.getReference();
        }
        
        if ("CREDIT".equals(tx.getType())) {
            return "Money received in wallet";
        } else if ("DEBIT".equals(tx.getType())) {
            return "Money sent from wallet";
        } else if ("DEPOSIT".equals(tx.getType())) {
            return "Money added to wallet";
        } else if ("WITHDRAWAL".equals(tx.getType())) {
            return "Money withdrawn from wallet";
        }
        
        return "Transaction";
    }
    
    private String generateDescription(WalletTransaction tx) {
        if (tx.getReference() != null) {
            return tx.getReference();
        }
        
        if ("CREDIT".equals(tx.getType())) {
            return "Money added to wallet";
        } else {
            return "Money withdrawn from wallet";
        }
    }
    
    private String categorizeTransaction(Transaction tx) {
        String ref = tx.getReference();
        if (ref == null) return "Other";
        
        ref = ref.toLowerCase();
        
        if (ref.contains("food") || ref.contains("restaurant") || ref.contains("lunch") || ref.contains("dinner")) {
            return "Food & Dining";
        } else if (ref.contains("shop") || ref.contains("mall") || ref.contains("store") || ref.contains("amazon")) {
            return "Shopping";
        } else if (ref.contains("bill") || ref.contains("electricity") || ref.contains("water") || ref.contains("gas")) {
            return "Bills & Utilities";
        } else if (ref.contains("transfer") || ref.contains("sent") || ref.contains("received") || ref.contains("payment")) {
            return "Transfer";
        } else if (ref.contains("salary") || ref.contains("income") || ref.contains("bonus")) {
            return "Income";
        } else if (ref.contains("withdraw") || ref.contains("atm")) {
            return "Withdrawal";
        } else if (ref.contains("add") || ref.contains("deposit")) {
            return "Deposit";
        }
        
        return "Other";
    }
}