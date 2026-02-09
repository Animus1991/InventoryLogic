package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.dto.ValuationReport;
import gr.aueb.sev.inventorylogic.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final DashboardService dashboardService;

    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/valuation")
    public ResponseEntity<ValuationReport> getValuation() {
        return ResponseEntity.ok(dashboardService.getValuationReport());
    }
}
