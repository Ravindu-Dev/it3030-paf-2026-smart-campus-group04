package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration for JWT-based authentication.
 *
 * <p>
 * Key decisions:
 * </p>
 * <ul>
 * <li>CSRF disabled — we use stateless JWT tokens, not cookies</li>
 * <li>Session management STATELESS — no server-side sessions</li>
 * <li>/api/auth/google is public — the only way to get a JWT</li>
 * <li>/api/auth/** other than google requires authentication (e.g., /me,
 * /profile)</li>
 * <li>All other /api/** requires authentication</li>
 * <li>@PreAuthorize annotations control role-based access on individual
 * endpoints</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @Secured, @RolesAllowed
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS — allow requests from Vite dev server
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF — not needed for stateless JWT auth
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Stateless sessions — JWT handles authentication state
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no JWT required
                        // Note: context-path is /api, so Spring Security paths are relative to it
                        .requestMatchers("/auth/google").permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated())

                // 5. Register our JWT filter BEFORE Spring's default auth filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Vite dev server
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
