package rug.backend.config;

import java.io.IOException;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import rug.backend.service.AdminAuthService;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {
    private final AdminAuthService adminAuthService;

    public AdminAuthInterceptor(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || !requiresAdmin(request)) {
            return true;
        }

        if (adminAuthService.isValidToken(request.getHeader("X-Admin-Token"))) {
            return true;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Acceso admin requerido.\"}");
        return false;
    }

    private boolean requiresAdmin(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        if (path.matches("^/api/products(/.*)?$")) {
            return !HttpMethod.GET.matches(method);
        }

        if (path.matches("^/api/orders(/.*)?$")) {
            return !HttpMethod.POST.matches(method);
        }

        if (path.matches("^/api/payments(/.*)?$")) {
            return !path.equals("/api/payments/intent") && !path.equals("/api/payments/flow/confirmation");
        }

        if (path.matches("^/api/purchase-orders(/.*)?$")) {
            return true;
        }

        if (path.equals("/api/reviews/admin")) {
            return true;
        }

        if (path.matches("^/api/reviews/\\d+(/approval)?$")) {
            return HttpMethod.PUT.matches(method) || HttpMethod.DELETE.matches(method);
        }

        if (path.equals("/api/quotes")) {
            return HttpMethod.GET.matches(method);
        }

        if (path.matches("^/api/quotes/\\d+$")) {
            return HttpMethod.DELETE.matches(method);
        }

        return false;
    }
}
