package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class KycAdminDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userAvatar;
    private LocalDateTime submittedDate;
    private String status;
    private List<Map<String, Object>> documents;
}