package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT Authentication Filter — runs on every HTTP request.
 *
 * <p>
 * Workflow:
 * </p>
 * <ol>
 * <li>Extract the Bearer token from the {@code Authorization} header</li>
 * <li>Validate the token using {@link JwtTokenProvider}</li>
 * <li>Load the user from MongoDB using the user ID in the token</li>
 * <li>Set the authenticated user in Spring Security's
 * {@code SecurityContext}</li>
 * </ol>
 *
 * <p>
 * If the token is missing or invalid, the filter does nothing and the
 * request continues unauthenticated (Spring Security will then deny it
 * if the endpoint requires authentication).
 * </p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. Extract the JWT from the Authorization header
            String token = extractTokenFromRequest(request);

            // 2. Validate and authenticate
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                String userId = jwtTokenProvider.getUserIdFromToken(token);

                // 3. Load user from database
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    // 4. Create authentication with the user's role as granted authority
                    // The role is prefixed with "ROLE_" for Spring Security's
                    // @PreAuthorize("hasRole('ADMIN')")
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user, // principal — the full User object
                            null, // credentials — not needed for JWT auth
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 5. Set the authentication in the security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        // Continue the filter chain regardless — unauthenticated requests will be
        // rejected by Spring Security's authorization rules if needed
        filterChain.doFilter(request, response);
    }

    /**
     * Extract the Bearer token from the Authorization header.
     *
     * @param request the HTTP request
     * @return the JWT string, or null if not present
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
