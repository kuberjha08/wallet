package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.WalletAdminDto;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.entity.WalletTransaction;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.repository.WalletTransactionRepository;
import com.wallet.wallet_backend.service.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminWalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletService walletService;

    public AdminWalletService(
            UserRepository userRepository,
            WalletTransactionRepository walletTransactionRepository,
            WalletService walletService) {
        this.userRepository = userRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.walletService = walletService;
    }

    public Map<String, Object> getWalletOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        Double totalBalance = userRepository.sumWalletBalance();
        Long totalUsers = userRepository.count();
        Long activeWallets = userRepository.countByWalletFrozenFalse();
        Long frozenWallets = userRepository.countByWalletFrozenTrue();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        Double todayVolume = walletTransactionRepository.sumAmountByDateRange(startOfDay, now);
        
        LocalDateTime yesterdayStart = startOfDay.minusDays(1);
        Double yesterdayVolume = walletTransactionRepository.sumAmountByDateRange(yesterdayStart, startOfDay);
        
        overview.put("totalBalance", totalBalance != null ? totalBalance : 0.0);
        overview.put("totalUsers", totalUsers);
        overview.put("activeWallets", activeWallets);
        overview.put("frozenWallets", frozenWallets);
        overview.put("todayVolume", todayVolume != null ? todayVolume : 0.0);
        overview.put("yesterdayVolume", yesterdayVolume != null ? yesterdayVolume : 0.0);
        
        return overview;
    }

    public List<WalletAdminDto> getUserWallets(String search) {
        List<User> users;
        
        if (search != null && !search.isEmpty()) {
            users = userRepository.searchUsers(search);
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream()
                .map(user -> WalletAdminDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .balance(user.getWalletBalance())
                        .status(user.getWalletFrozen() ? "Frozen" : "Active")
                        .frozen(user.getWalletFrozen())
                        .lastActive(user.getLastActive())
                        .build())
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRecentWalletTransactions(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<WalletTransaction> transactions = walletTransactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        
        return transactions.getContent().stream()
                .map(tx -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", tx.getId());
                    map.put("userId", tx.getUserId());
                    
                    Optional<User> user = userRepository.findById(tx.getUserId());
                    map.put("user", user.map(User::getName).orElse("Unknown"));
                    
                    map.put("type", tx.getType());
                    map.put("amount", tx.getAmount());
                    map.put("date", tx.getCreatedAt());
                    
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void adjustWallet(Long userId, Double amount, String type, String reason) {
        if ("CREDIT".equalsIgnoreCase(type)) {
            walletService.credit(userId, amount, "ADMIN_" + reason);
        } else if ("DEBIT".equalsIgnoreCase(type)) {
            walletService.debit(userId, amount, "ADMIN_" + reason);
        } else {
            throw new RuntimeException("Invalid transaction type");
        }
    }

    @Transactional
    public void bulkCredit(List<Long> userIds, Double amount, String reason) {
        for (Long userId : userIds) {
            try {
                walletService.credit(userId, amount, "BULK_ADMIN_" + reason);
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Failed to credit user " + userId + ": " + e.getMessage());
            }
        }
    }

    @Transactional
    public void bulkFreeze(List<Long> userIds) {
        for (Long userId : userIds) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && !user.getWalletFrozen()) {
                user.setWalletFrozen(true);
                userRepository.save(user);
            }
        }
    }
}