package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.ReportRequestDto;
import com.wallet.wallet_backend.service.AdminReportService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin/reports")
public class AdminReportController {
    
    private final AdminReportService reportService;
    
    public AdminReportController(AdminReportService reportService) {
        this.reportService = reportService;
    }
    
    @PostMapping("/generate")
    public Map<String, Object> generateReport(@RequestBody ReportRequestDto request) {
        return reportService.generateReport(request);
    }
    
    @PostMapping("/export")
    public Map<String, String> exportReport(@RequestBody ReportRequestDto request) {
        return reportService.exportReport(request);
    }
}