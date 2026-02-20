package com.wallet.wallet_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReportRequestDto {
    private String reportType; // transactions, users, kyc, wallet, revenue, compliance
    private String dateRange; // today, yesterday, week, month, quarter, year, custom
    private LocalDate startDate;
    private LocalDate endDate;
    private String format; // pdf, excel, csv
    private Boolean includeCharts;
    private Boolean includeTables;
    private List<String> selectedColumns;
    
    // Add default values
    public String getDateRange() {
        return dateRange != null ? dateRange : "month";
    }
    
    public String getFormat() {
        return format != null ? format : "pdf";
    }
    
    public Boolean getIncludeCharts() {
        return includeCharts != null ? includeCharts : true;
    }
    
    public Boolean getIncludeTables() {
        return includeTables != null ? includeTables : true;
    }
}