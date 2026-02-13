package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.WalletTransactionResponseDto;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.entity.WalletTransaction;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {
    private final UserRepository userRepository;
    private final WalletTransactionRepository transactionRepository;
    
    public WalletService(UserRepository userRepository, 
                        WalletTransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }
    
    @Transactional
    public void credit(Long userId, Double amount, String reference) {
        if (amount <= 0) throw new RuntimeException("Amount must be greater than zero");
        
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setWalletBalance(user.getWalletBalance() + amount);
        
        WalletTransaction txn = WalletTransaction.builder()
                .userId(userId)
                .amount(amount)
                .type("CREDIT")
                .reference(reference)
                .build();
        
        userRepository.save(user);
        transactionRepository.save(txn);
    }
    
    @Transactional
    public void debit(Long userId, Double amount, String reference) {
        if (amount <= 0) throw new RuntimeException("Amount must be greater than zero");
        
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getWalletFrozen()) {
            throw new RuntimeException("Wallet is frozen");
        }
        
        if (user.getWalletBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        
        user.setWalletBalance(user.getWalletBalance() - amount);
        
        WalletTransaction txn = WalletTransaction.builder()
                .userId(userId)
                .amount(amount)
                .type("DEBIT")
                .reference(reference)
                .build();
        
        userRepository.save(user);
        transactionRepository.save(txn);
    }
    
    public List<WalletTransactionResponseDto> getStatement(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(txn -> {
                    WalletTransactionResponseDto dto = new WalletTransactionResponseDto();
                    dto.setId(txn.getId());
                    dto.setAmount(txn.getAmount());
                    dto.setType(txn.getType());
                    dto.setReference(txn.getReference());
                    dto.setCreatedAt(txn.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}