package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.AppSetting;
import gr.aueb.sev.inventorylogic.domain.InviteToken;
import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.repo.AppSettingRepo;
import gr.aueb.sev.inventorylogic.repo.AuditLogRepo;
import gr.aueb.sev.inventorylogic.repo.InviteTokenRepo;
import gr.aueb.sev.inventorylogic.repo.ProductRepo;
import gr.aueb.sev.inventorylogic.repo.UserRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepo userRepo;
    private final AppSettingRepo appSettingRepo;
    private final InviteTokenRepo inviteTokenRepo;
    private final ProductRepo productRepo;
    private final AuditLogRepo auditLogRepo;

    /** Default expiry for invite links: 7 days */
    private static final int INVITE_VALIDITY_DAYS = 7;

    public AdminService(UserRepo userRepo, AppSettingRepo appSettingRepo, InviteTokenRepo inviteTokenRepo,
                        ProductRepo productRepo, AuditLogRepo auditLogRepo) {
        this.userRepo = userRepo;
        this.appSettingRepo = appSettingRepo;
        this.inviteTokenRepo = inviteTokenRepo;
        this.productRepo = productRepo;
        this.auditLogRepo = auditLogRepo;
    }

    public Map<String, Object> getOverview() {
        long userCount = userRepo.count();
        long productCount = productRepo.count();
        boolean inviteOnly = getInviteOnly();
        return Map.<String, Object>of(
                "userCount", userCount,
                "productCount", productCount,
                "inviteOnly", inviteOnly
        );
    }

    public List<Map<String, Object>> getRecentActivity(int limit) {
        return auditLogRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100)))
                .stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "productId", a.getProductId(),
                        "action", a.getAction(),
                        "details", a.getDetails() != null ? a.getDetails() : "",
                        "createdAt", a.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    public String exportProductsCsv() {
        List<Product> all = productRepo.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,sku,name,category,barcode,unit,stock,minStock,price,location\n");
        for (Product p : all) {
            sb.append(escapeCsv(p.getId())).append(",");
            sb.append(escapeCsv(p.getSku())).append(",");
            sb.append(escapeCsv(p.getName())).append(",");
            sb.append(escapeCsv(p.getCategory())).append(",");
            sb.append(escapeCsv(p.getBarcode())).append(",");
            sb.append(escapeCsv(p.getUnit())).append(",");
            sb.append(p.getStock()).append(",");
            sb.append(p.getMinStock()).append(",");
            sb.append(p.getPrice() != null ? p.getPrice() : "").append(",");
            sb.append(escapeCsv(p.getLocation())).append("\n");
        }
        return sb.toString();
    }

    private static String escapeCsv(Object o) {
        if (o == null) return "";
        String s = o.toString().replace("\"", "\"\"");
        return "\"" + s + "\"";
    }

    public List<Map<String, Object>> listUsers() {
        return userRepo.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "admin", u.isAdmin()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public String createInvite(String createdByUsername) {
        String token = UUID.randomUUID().toString().replace("-", "");
        Instant expiresAt = Instant.now().plusSeconds(INVITE_VALIDITY_DAYS * 86400L);
        InviteToken invite = new InviteToken(token, expiresAt, createdByUsername);
        inviteTokenRepo.save(invite);
        return token;
    }

    public boolean getInviteOnly() {
        return appSettingRepo.findByKey(AuthService.SETTING_INVITE_ONLY)
                .map(s -> "true".equalsIgnoreCase(s.getValue()))
                .orElse(false);
    }

    @Transactional
    public void setInviteOnly(boolean inviteOnly) {
        AppSetting s = appSettingRepo.findByKey(AuthService.SETTING_INVITE_ONLY)
                .orElseGet(() -> {
                    AppSetting n = new AppSetting(AuthService.SETTING_INVITE_ONLY, "false");
                    return appSettingRepo.save(n);
                });
        s.setValue(inviteOnly ? "true" : "false");
        appSettingRepo.save(s);
    }
}
