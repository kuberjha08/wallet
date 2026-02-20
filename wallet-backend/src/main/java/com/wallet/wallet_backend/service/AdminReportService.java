package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.ReportRequestDto;
import com.wallet.wallet_backend.repository.WalletTransactionRepository;
import com.wallet.wallet_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AdminReportService {
    
    private final WalletTransactionRepository walletTransactionRepository; // Changed
    private final UserRepository userRepository;
    
    public AdminReportService(WalletTransactionRepository walletTransactionRepository, // Changed
                            UserRepository userRepository) {
        this.walletTransactionRepository = walletTransactionRepository;
        this.userRepository = userRepository;
    }
    
    public Map<String, Object> generateReport(ReportRequestDto request) {
        LocalDateTime startDate = calculateStartDate(request);
        LocalDateTime endDate = calculateEndDate(request);
        
        Map<String, Object> report = new HashMap<>();
        
        switch (request.getReportType()) {
            case "transactions":
                report = generateTransactionReport(startDate, endDate, request);
                break;
            case "users":
                report = generateUserReport(startDate, endDate, request);
                break;
            case "kyc":
                report = generateKycReport(startDate, endDate, request);
                break;
            case "wallet":
                report = generateWalletReport(startDate, endDate, request);
                break;
            case "revenue":
                report = generateRevenueReport(startDate, endDate, request);
                break;
            default:
                throw new RuntimeException("Invalid report type");
        }
        
        return report;
    }
    
    public Map<String, String> exportReport(ReportRequestDto request) {
        Map<String, String> export = new HashMap<>();
        String fileName = request.getReportType() + "_" + System.currentTimeMillis() + "." + request.getFormat();
        export.put("fileName", fileName);
        export.put("url", "/exports/" + fileName);
        export.put("message", "Report generated successfully");
        return export;
    }
    
    private LocalDateTime calculateStartDate(ReportRequestDto request) {
        LocalDateTime now = LocalDateTime.now();
        String dateRange = request.getDateRange();
        
        if (dateRange == null) {
            dateRange = "month";
        }
        
        switch (dateRange) {
            case "today":
                return now.truncatedTo(ChronoUnit.DAYS);
            case "yesterday":
                return now.minusDays(1).truncatedTo(ChronoUnit.DAYS);
            case "week":
                return now.minusDays(7).truncatedTo(ChronoUnit.DAYS);
            case "month":
                return now.minusDays(30).truncatedTo(ChronoUnit.DAYS);
            case "quarter":
                return now.minusDays(90).truncatedTo(ChronoUnit.DAYS);
            case "year":
                return now.minusDays(365).truncatedTo(ChronoUnit.DAYS);
            case "custom":
                if (request.getStartDate() != null) {
                    return request.getStartDate().atStartOfDay();
                }
                return now.minusDays(30).truncatedTo(ChronoUnit.DAYS);
            default:
                return now.minusDays(30).truncatedTo(ChronoUnit.DAYS);
        }
    }
    
    private LocalDateTime calculateEndDate(ReportRequestDto request) {
        if ("custom".equals(request.getDateRange()) && request.getEndDate() != null) {
            return request.getEndDate().atTime(23, 59, 59);
        }
        return LocalDateTime.now();
    }
    
    private Map<String, Object> generateTransactionReport(LocalDateTime start, LocalDateTime end, ReportRequestDto request) {
        Map<String, Object> report = new HashMap<>();
        
        // Use walletTransactionRepository instead of transactionRepository
        Long totalCount = walletTransactionRepository.countByDateRange(start, end);
        Double totalVolume = walletTransactionRepository.sumAmountByDateRange(start, end);
        
        // For trends, we need to group by date - let's do it manually for now
        List<Map<String, Object>> trends = new ArrayList<>();
        
        // You can implement this later if needed
        // List<Map<String, Object>> summary = walletTransactionRepository.getTransactionSummary(start);
        
        report.put("reportType", "Transaction Report");
        report.put("dateRange", start + " to " + end);
        report.put("totalTransactions", totalCount != null ? totalCount : 0L);
        report.put("totalVolume", totalVolume != null ? totalVolume : 0.0);
        report.put("trends", trends);
        report.put("summary", getTransactionSummary(start));
        
        return report;
    }
    
    private List<Map<String, Object>> getTransactionSummary(LocalDateTime since) {
        // This is a simple implementation - you can enhance it
        List<Map<String, Object>> summary = new ArrayList<>();
        
        Map<String, Object> creditSummary = new HashMap<>();
        creditSummary.put("type", "CREDIT");
        creditSummary.put("count", 0); // You can calculate this
        creditSummary.put("total", 0.0);
        summary.add(creditSummary);
        
        Map<String, Object> debitSummary = new HashMap<>();
        debitSummary.put("type", "DEBIT");
        debitSummary.put("count", 0);
        debitSummary.put("total", 0.0);
        summary.add(debitSummary);
        
        return summary;
    }
    
    private Map<String, Object> generateUserReport(LocalDateTime start, LocalDateTime end, ReportRequestDto request) {
        Map<String, Object> report = new HashMap<>();
        
        Long newUsers = userRepository.countByCreatedAtBetween(start, end);
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByLastActiveAfter(start);
        
        report.put("reportType", "User Report");
        report.put("dateRange", start + " to " + end);
        report.put("newUsers", newUsers != null ? newUsers : 0L);
        report.put("totalUsers", totalUsers != null ? totalUsers : 0L);
        report.put("activeUsers", activeUsers != null ? activeUsers : 0L);
        
        return report;
    }
    
    private Map<String, Object> generateKycReport(LocalDateTime start, LocalDateTime end, ReportRequestDto request) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "KYC Report");
        report.put("dateRange", start + " to " + end);
        report.put("message", "KYC report generation in progress");
        return report;
    }
    
    private Map<String, Object> generateWalletReport(LocalDateTime start, LocalDateTime end, ReportRequestDto request) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Wallet Report");
        report.put("dateRange", start + " to " + end);
        
        Double totalCredits = walletTransactionRepository.sumAmountByDateRangeAndType(start, end, "CREDIT");
        Double totalDebits = walletTransactionRepository.sumAmountByDateRangeAndType(start, end, "DEBIT");
        
        report.put("totalCredits", totalCredits != null ? totalCredits : 0.0);
        report.put("totalDebits", totalDebits != null ? totalDebits : 0.0);
        report.put("netFlow", (totalCredits != null ? totalCredits : 0.0) - (totalDebits != null ? totalDebits : 0.0));
        
        return report;
    }
    
    private Map<String, Object> generateRevenueReport(LocalDateTime start, LocalDateTime end, ReportRequestDto request) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Revenue Report");
        report.put("dateRange", start + " to " + end);
        report.put("message", "Revenue report generation in progress");
        return report;
    }
}