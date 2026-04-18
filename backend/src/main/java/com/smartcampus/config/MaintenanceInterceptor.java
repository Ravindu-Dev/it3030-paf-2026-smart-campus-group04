package com.smartcampus.config;

import com.smartcampus.service.MaintenanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class MaintenanceInterceptor implements HandlerInterceptor {

    private final MaintenanceService maintenanceService;

    public MaintenanceInterceptor(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        // Exclude specific paths that must always be accessible
        String path = request.getRequestURI();
        
        // Always allow maintenance status checks and auth endpoints
        // NOTE: getRequestURI() includes the context-path (/api), so use full prefix.
        if (path.startsWith("/api/maintenance/status") || path.startsWith("/api/auth/")) {
            return true;
        }

        // If maintenance is not active, allow everything
        if (!maintenanceService.isMaintenanceActive()) {
            return true;
        }

        // Check if user is the designated maintenance admin by email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.smartcampus.model.User user) {
            if ("smartcampus43@gmail.com".equals(user.getEmail())) {
                return true;
            }
        }

        // Otherwise, block with 503
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setContentType("text/plain");
        response.getWriter().write("MAINTENANCE");
        return false;
    }
}
