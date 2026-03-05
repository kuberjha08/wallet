package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class TransactionSummaryDto {
    private String id;              // Transaction ID
    private String type;             // CREDIT, DEBIT
    private Double amount;
    private String counterparty;     // Who sent/received
    private String description;      // Description/note
    private LocalDateTime date;
    private String status;           // COMPLETED, PENDING, FAILED
    private String paymentMethod;    // WALLET, BANK_TRANSFER, etc.
    
    // For UI formatting - yeh methods frontend ke liye helpful hain
    public String getFormattedDate() {
        if (date == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        return date.format(formatter);
    }
    
    public String getSign() {
        return "CREDIT".equals(type) ? "+" : "-";
    }
    
    public String getAmountWithSign() {
        return getSign() + " ₹" + String.format("%.2f", amount);
    }
    
    public String getFormattedStatus() {
        if (status == null) return "UNKNOWN";
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }
    
    public String getStatusColor() {
        if (status == null) return "gray";
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return "green";
            case "PENDING":
                return "orange";
            case "FAILED":
                return "red";
            default:
                return "gray";
        }
    }
    
    public String getTypeIcon() {
        return "CREDIT".equals(type) ? "arrow-downward" : "arrow-upward";
    }
    
    public String getTypeColor() {
        return "CREDIT".equals(type) ? "success" : "danger";
    }
}