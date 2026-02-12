package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.service.AdminService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview() {
        return adminService.getOverview();
    }

    @GetMapping("/activity")
    public List<Map<String, Object>> getActivity(@RequestParam(defaultValue = "50") int limit) {
        return adminService.getRecentActivity(limit);
    }

    @GetMapping(value = "/export/products", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<String> exportProducts() {
        String csv = adminService.exportProductsCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "products-export.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return adminService.listUsers();
    }

    @PostMapping("/invites")
    public ResponseEntity<?> createInvite(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String token = adminService.createInvite(principal.getName());
        String link = "/register?invite=" + token;
        return ResponseEntity.ok(Map.of(
                "token", token,
                "link", link
        ));
    }

    @GetMapping("/settings")
    public Map<String, Object> getSettings() {
        return Map.of("inviteOnly", adminService.getInviteOnly());
    }

    @PatchMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> body) {
        Object inviteOnlyObj = body.get("inviteOnly");
        if (inviteOnlyObj instanceof Boolean) {
            adminService.setInviteOnly((Boolean) inviteOnlyObj);
            return ResponseEntity.ok(Map.of("inviteOnly", adminService.getInviteOnly()));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "inviteOnly must be boolean"));
    }
}
