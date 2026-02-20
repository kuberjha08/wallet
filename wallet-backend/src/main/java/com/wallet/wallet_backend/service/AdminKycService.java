package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.KycAdminDto;
import com.wallet.wallet_backend.dto.PagedResponse;
import com.wallet.wallet_backend.entity.KycDocument;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.KycDocumentRepository;
import com.wallet.wallet_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminKycService {
    
    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    
    public AdminKycService(KycDocumentRepository kycDocumentRepository, UserRepository userRepository) {
        this.kycDocumentRepository = kycDocumentRepository;
        this.userRepository = userRepository;
    }
    
    public PagedResponse<KycAdminDto> getKycRequests(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<KycDocument> kycPage;
        
        if (search != null && !search.isEmpty()) {
            kycPage = kycDocumentRepository.searchKyc(search, pageable);
        } else if (status != null && !status.isEmpty() && !"all".equals(status)) {
            kycPage = kycDocumentRepository.findByStatus(status.toUpperCase(), pageable);
        } else {
            kycPage = kycDocumentRepository.findAll(pageable);
        }
        
        List<KycAdminDto> kycList = kycPage.getContent().stream()
                .map(this::mapToKycAdminDto)
                .collect(Collectors.toList());
        
        return PagedResponse.<KycAdminDto>builder()
                .content(kycList)
                .page(page)
                .size(size)
                .totalElements(kycPage.getTotalElements())
                .totalPages(kycPage.getTotalPages())
                .last(kycPage.isLast())
                .build();
    }
    
    @Transactional
    public void approveKyc(Long documentId, Long adminId) {
        KycDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("KYC document not found"));
        
        document.setStatus("APPROVED");
        document.setReviewedAt(LocalDateTime.now());
        document.setReviewedBy(adminId);
        kycDocumentRepository.save(document);
        
        // Update user KYC status
        User user = userRepository.findById(document.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus("APPROVED");
        userRepository.save(user);
    }
    
    @Transactional
    public void rejectKyc(Long documentId, Long adminId, String reason) {
        KycDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("KYC document not found"));
        
        document.setStatus("REJECTED");
        document.setReviewedAt(LocalDateTime.now());
        document.setReviewedBy(adminId);
        document.setRejectionReason(reason);
        kycDocumentRepository.save(document);
        
        // Update user KYC status
        User user = userRepository.findById(document.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus("REJECTED");
        userRepository.save(user);
    }
    
    public Map<String, Object> getKycStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("pending", kycDocumentRepository.countByStatus("PENDING"));
        stats.put("approved", kycDocumentRepository.countByStatus("APPROVED"));
        stats.put("rejected", kycDocumentRepository.countByStatus("REJECTED"));
        stats.put("total", kycDocumentRepository.count());
        
        return stats;
    }
    
    private KycAdminDto mapToKycAdminDto(KycDocument document) {
        User user = userRepository.findById(document.getUserId()).orElse(null);
        
        List<Map<String, Object>> documents = new ArrayList<>();
        Map<String, Object> docMap = new HashMap<>();
        docMap.put("type", document.getDocumentType());
        docMap.put("icon", document.getDocumentType().equals("PASSPORT") ? "BadgeIcon" : 
                           document.getDocumentType().equals("SELFIE") ? "FaceIcon" : "HomeIcon");
        documents.add(docMap);
        
        return KycAdminDto.builder()
                .id(document.getId())
                .userId(document.getUserId())
                .userName(user != null ? user.getName() : "Unknown")
                .userEmail(user != null ? user.getEmail() : "")
                .userAvatar(user != null ? user.getProfilePicture() : null)
                .submittedDate(document.getSubmittedAt())
                .status(document.getStatus().toLowerCase())
                .documents(documents)
                .build();
    }
}